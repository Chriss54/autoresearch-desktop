/**
 * /api/engine — Training loop start/stop control
 * Uses PID file tracking for subprocess lifecycle management
 * across hot-module-replacement and server restarts.
 */
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const db = require("../../../lib/database");

// In-memory tracking of running processes (supplemented by PID files)
const runningProcesses = new Map();

const PID_DIR = "/tmp";

function getPidFilePath(workflowId) {
  return path.join(PID_DIR, `autoresearch_${workflowId}.pid`);
}

function readPidFile(workflowId) {
  const pidPath = getPidFilePath(workflowId);
  try {
    if (fs.existsSync(pidPath)) {
      const pid = parseInt(fs.readFileSync(pidPath, "utf8").trim(), 10);
      return isNaN(pid) ? null : pid;
    }
  } catch {
    // Ignore read errors
  }
  return null;
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0); // Signal 0 = check existence
    return true;
  } catch {
    return false;
  }
}

function cleanupStalePids() {
  /**
   * On server restart, check for stale PID files from dead processes.
   * If the process is dead, clean up the PID file and reset workflow status.
   */
  try {
    const files = fs.readdirSync(PID_DIR).filter(f => f.startsWith("autoresearch_") && f.endsWith(".pid"));
    for (const file of files) {
      const workflowId = file.replace("autoresearch_", "").replace(".pid", "");
      const pid = readPidFile(workflowId);
      if (pid && !isProcessAlive(pid)) {
        // Process is dead — clean up
        fs.unlinkSync(path.join(PID_DIR, file));
        db.updateWorkflowStatus(workflowId, "error");
        db.addLog({ workflowId, text: "⚠️ Process died unexpectedly (detected on server restart)", type: "error" });
      }
    }
  } catch {
    // Non-critical
  }
}

// Run cleanup on module load
cleanupStalePids();

export async function GET() {
  try {
    const running = {};
    for (const [workflowId, proc] of runningProcesses.entries()) {
      running[workflowId] = {
        pid: proc.pid,
        running: !proc.killed,
      };
    }

    // Also check PID files for processes we don't have in memory
    try {
      const files = fs.readdirSync(PID_DIR).filter(f => f.startsWith("autoresearch_") && f.endsWith(".pid"));
      for (const file of files) {
        const workflowId = file.replace("autoresearch_", "").replace(".pid", "");
        if (!running[workflowId]) {
          const pid = readPidFile(workflowId);
          if (pid) {
            running[workflowId] = {
              pid,
              running: isProcessAlive(pid),
            };
          }
        }
      }
    } catch {
      // Non-critical
    }

    return Response.json({ processes: running });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, workflowId } = body;

    if (!action || !workflowId) {
      return Response.json({ error: "action and workflowId are required" }, { status: 400 });
    }

    if (action === "start") {
      // Check if already running (in-memory or PID file)
      if (runningProcesses.has(workflowId) && !runningProcesses.get(workflowId).killed) {
        return Response.json({ error: "Workflow is already running" }, { status: 409 });
      }

      // Also check PID file for orphaned processes
      const existingPid = readPidFile(workflowId);
      if (existingPid && isProcessAlive(existingPid)) {
        return Response.json({ error: "Workflow is already running (orphaned process detected)" }, { status: 409 });
      }

      const workflow = db.getWorkflow(workflowId);
      if (!workflow) {
        return Response.json({ error: "Workflow not found" }, { status: 404 });
      }

      // Cloud execution via Modal
      if (workflow.target === "cloud") {
        db.updateWorkflowStatus(workflowId, "running");
        db.addLog({ workflowId, text: "☁️ Cloud-Training wird auf Modal gestartet...", type: "info" });

        const engineDir = path.resolve(process.cwd(), "..", "engine");
        const proc = spawn("uv", [
          "run", "modal", "run", "modal_train.py",
          "--workflow-json", JSON.stringify(workflow),
        ], {
          cwd: engineDir,
          stdio: ["ignore", "pipe", "pipe"],
          env: { ...process.env },
        });

        runningProcesses.set(workflowId, proc);

        // Handle stdout — Modal training emits JSON events
        proc.stdout.on("data", (data) => {
          const lines = data.toString().split("\n").filter(Boolean);
          for (const line of lines) {
            try {
              const event = JSON.parse(line);
              if (event.type === "experiment") {
                db.createExperiment({
                  workflowId,
                  commitHash: event.commit || "",
                  change: event.change || "",
                  valBpb: event.valBpb || 0,
                  peakMemory: event.peakMemory || 0,
                  status: event.status || "keep",
                  isRecord: event.isRecord || false,
                });
              }
              if (event.type === "log") {
                db.addLog({ workflowId, text: event.text, type: event.logType || "info" });
              }
            } catch {
              // Not JSON — treat as log
              if (line.trim()) {
                db.addLog({ workflowId, text: line.trim(), type: "info" });
              }
            }
          }
        });

        proc.stderr.on("data", (data) => {
          const text = data.toString().trim();
          if (text) {
            db.addLog({ workflowId, text, type: "info" });
          }
        });

        proc.on("close", (code) => {
          runningProcesses.delete(workflowId);
          db.updateWorkflowStatus(workflowId, code === 0 ? "completed" : "error");
          db.addLog({
            workflowId,
            text: code === 0
              ? "✅ Cloud-Training erfolgreich abgeschlossen"
              : `❌ Cloud-Training mit Code ${code} beendet`,
            type: code === 0 ? "success" : "error",
          });
        });

        return Response.json({ success: true, pid: proc.pid, target: "cloud" });
      }

      // Update workflow status
      db.updateWorkflowStatus(workflowId, "running");

      // Spawn the training engine subprocess
      const engineDir = path.resolve(process.cwd(), "..", "engine");
      const proc = spawn("uv", [
        "run", "run_experiment.py",
        "--workflow-json", JSON.stringify(workflow),
        "--total-time-hours", "10",
        "--max-experiments", "0",
      ], {
        cwd: engineDir,
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env },
      });

      runningProcesses.set(workflowId, proc);

      // Handle stdout (structured JSON lines from the engine)
      proc.stdout.on("data", (data) => {
        const lines = data.toString().split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const event = JSON.parse(line);
            if (event.type === "experiment") {
              db.createExperiment({
                workflowId,
                commitHash: event.commit || "",
                change: event.change || "",
                valBpb: event.valBpb || 0,
                peakMemory: event.peakMemory || 0,
                status: event.status || "keep",
                isRecord: event.isRecord || false,
              });
            }
            if (event.type === "log") {
              db.addLog({ workflowId, text: event.text, type: event.logType || "info" });
            }
          } catch {
            // Not JSON — treat as a log line
            db.addLog({ workflowId, text: line, type: "info" });
          }
        }
      });

      // Handle stderr
      proc.stderr.on("data", (data) => {
        db.addLog({ workflowId, text: data.toString().trim(), type: "error" });
      });

      // Handle process exit
      proc.on("close", (code) => {
        runningProcesses.delete(workflowId);
        // PID file is cleaned up by the Python process itself
        db.updateWorkflowStatus(workflowId, code === 0 ? "completed" : "error");
        db.addLog({
          workflowId,
          text: code === 0
            ? "✅ Training loop finished successfully"
            : `❌ Training loop exited with code ${code}`,
          type: code === 0 ? "success" : "error",
        });
      });

      return Response.json({ success: true, pid: proc.pid });
    }

    if (action === "stop") {
      const proc = runningProcesses.get(workflowId);
      if (proc && !proc.killed) {
        proc.kill("SIGTERM");
        runningProcesses.delete(workflowId);
        db.updateWorkflowStatus(workflowId, "idle");
        db.addLog({ workflowId, text: "⏹️ Training loop stopped by user", type: "info" });
        return Response.json({ success: true });
      }

      // Try PID file as fallback (orphaned process)
      const pid = readPidFile(workflowId);
      if (pid && isProcessAlive(pid)) {
        try {
          process.kill(pid, "SIGTERM");
        } catch {
          // Process may have already exited
        }
        // Clean up PID file
        const pidPath = getPidFilePath(workflowId);
        try { fs.unlinkSync(pidPath); } catch { /* ignore */ }

        db.updateWorkflowStatus(workflowId, "idle");
        db.addLog({ workflowId, text: "⏹️ Training loop stopped by user (via PID file recovery)", type: "info" });
        return Response.json({ success: true });
      }

      return Response.json({ error: "No running process for this workflow" }, { status: 404 });
    }

    if (action === "health") {
      // Health check: verify the process is still alive
      const proc = runningProcesses.get(workflowId);
      if (proc && !proc.killed) {
        return Response.json({ alive: true, pid: proc.pid });
      }
      const pid = readPidFile(workflowId);
      if (pid && isProcessAlive(pid)) {
        return Response.json({ alive: true, pid });
      }
      return Response.json({ alive: false });
    }

    return Response.json({ error: "Invalid action. Use 'start', 'stop', or 'health'" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
