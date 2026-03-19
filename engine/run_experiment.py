#!/usr/bin/env python3
"""
Autoresearch experiment runner — subprocess wrapper.
Orchestrates the autonomous research loop:
  1. Apply code change to train_mlx.py
  2. Run training (5 min)
  3. Compare val_bpb against best recorded
  4. Keep improvement, discard regression
  5. Report structured JSON events to stdout

Usage:
  uv run run_experiment.py --workflow-json '{"name":"...", ...}'
  uv run run_experiment.py --baseline  # Run baseline only

This script is launched by the Node.js backend via child_process.spawn.
"""

import argparse
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import time


ENGINE_DIR = os.path.dirname(os.path.abspath(__file__))
TRAIN_SCRIPT = os.path.join(ENGINE_DIR, "train_mlx.py")
TRAIN_BACKUP = os.path.join(ENGINE_DIR, ".train_mlx_original.py")

# Global flag for graceful shutdown
_shutdown_requested = False


def _sigterm_handler(signum, frame):
    """Handle SIGTERM gracefully: restore train_mlx.py from backup and exit cleanly."""
    global _shutdown_requested
    _shutdown_requested = True
    emit_log("⏹️ SIGTERM received — shutting down gracefully...", "info")

    # Restore original train_mlx.py from backup to prevent corruption
    if os.path.exists(TRAIN_BACKUP):
        try:
            shutil.copy2(TRAIN_BACKUP, TRAIN_SCRIPT)
            emit_log("✅ train_mlx.py restored from backup", "info")
        except Exception as e:
            emit_log(f"⚠️ Failed to restore backup: {e}", "error")

    # Clean up PID file
    _cleanup_pid_file()

    emit_log("👋 Experiment loop stopped cleanly", "info")
    sys.exit(0)


# Register SIGTERM handler immediately
signal.signal(signal.SIGTERM, _sigterm_handler)
signal.signal(signal.SIGINT, _sigterm_handler)


def _write_pid_file(workflow_id):
    """Write PID file for process tracking across server restarts."""
    pid_path = f"/tmp/autoresearch_{workflow_id}.pid"
    try:
        with open(pid_path, "w") as f:
            f.write(str(os.getpid()))
    except Exception:
        pass  # Non-critical


def _cleanup_pid_file():
    """Remove PID file on exit."""
    import glob
    for pid_file in glob.glob("/tmp/autoresearch_*.pid"):
        try:
            with open(pid_file) as f:
                pid = int(f.read().strip())
            if pid == os.getpid():
                os.remove(pid_file)
        except Exception:
            pass


def emit(event):
    """Emit a structured JSON event to stdout."""
    print(json.dumps(event), flush=True)


def emit_log(text, log_type="info"):
    emit({"type": "log", "text": text, "logType": log_type})


def emit_experiment(num, commit, change, val_bpb, peak_memory, status, is_record):
    emit({
        "type": "experiment",
        "num": num,
        "commit": commit,
        "change": change,
        "valBpb": val_bpb,
        "peakMemory": peak_memory,
        "status": status,
        "isRecord": is_record,
    })


def run_training():
    """Run train_mlx.py --json and capture structured output."""
    cmd = [sys.executable, TRAIN_SCRIPT, "--json"]
    result_data = None
    progress_events = []

    try:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=ENGINE_DIR,
            text=True,
        )

        for line in proc.stdout:
            # Check for shutdown between lines
            if _shutdown_requested:
                proc.terminate()
                return None, "Shutdown requested"

            line = line.strip()
            if not line:
                continue
            try:
                event = json.loads(line)
                if event.get("type") == "result":
                    result_data = event
                elif event.get("type") == "progress":
                    progress_events.append(event)
                    # Forward progress events to Node.js
                    emit(event)
                elif event.get("type") == "log":
                    emit(event)
            except json.JSONDecodeError:
                emit_log(line, "info")

        proc.wait()
        stderr_output = proc.stderr.read()
        if stderr_output.strip():
            # stderr contains debug info, only log errors
            for l in stderr_output.strip().splitlines()[-3:]:
                if "error" in l.lower() or "fail" in l.lower():
                    emit_log(l.strip(), "error")

        if proc.returncode != 0:
            return None, f"Training failed with exit code {proc.returncode}"

        return result_data, None

    except Exception as e:
        return None, str(e)


def generate_commit_hash():
    """Generate a short pseudo-commit hash."""
    import hashlib
    return hashlib.sha256(str(time.time()).encode()).hexdigest()[:7]


def run_baseline():
    """Run a single baseline training and return result."""
    emit_log("🚀 Experiment Loop gestartet — Running baseline...", "info")
    result, error = run_training()
    if error:
        emit_log(f"❌ Baseline failed: {error}", "error")
        return None
    if result:
        val_bpb = result.get("valBpb", float("inf"))
        peak_mem = result.get("peakMemoryMb", 0) / 1024
        commit = generate_commit_hash()
        emit_experiment(1, commit, "Baseline (original train.py)", val_bpb, round(peak_mem, 1), "keep", False)
        emit_log(f"[Exp #1] Baseline — val_bpb: {val_bpb:.6f}, peak_mem: {peak_mem:.1f}GB — KEEP ✅", "success")
        return val_bpb
    return None


def main():
    parser = argparse.ArgumentParser(description="AutoResearch experiment runner")
    parser.add_argument("--workflow-json", type=str, default="", help="Workflow configuration as JSON string")
    parser.add_argument("--baseline", action="store_true", help="Run baseline only")
    parser.add_argument("--max-experiments", type=int, default=0, help="Max number of experiments (0 = unlimited, use time budget)")
    parser.add_argument("--total-time-hours", type=float, default=0, help="Total time budget in hours (0 = use max-experiments)")
    args = parser.parse_args()

    workflow = {}
    if args.workflow_json:
        try:
            workflow = json.loads(args.workflow_json)
        except json.JSONDecodeError:
            emit_log("⚠️ Invalid workflow JSON, using defaults", "warning")

    workflow_name = workflow.get("name", "Unnamed Workflow")
    workflow_id = workflow.get("id", "unknown")
    strategy = workflow.get("strategy", "conservative")

    # Write PID file for tracking
    _write_pid_file(workflow_id)

    # Determine time budget from workflow or CLI args
    total_time_hours = args.total_time_hours
    if total_time_hours <= 0:
        # Try to derive from workflow timeBudget (which is per-experiment in minutes)
        # For overnight runs, default to 10 hours if no explicit limit
        total_time_hours = 10.0  # Default: 10 hours max

    max_experiments = args.max_experiments  # 0 = unlimited (use time budget)

    start_time = time.time()
    deadline = start_time + (total_time_hours * 3600)

    emit_log(f"🚀 Experiment Loop gestartet — Workflow: {workflow_name}", "info")
    emit_log(f"⏰ Time budget: {total_time_hours:.1f}h | Max experiments: {'unlimited' if max_experiments == 0 else max_experiments}", "info")

    # Backup original train.py
    if not os.path.exists(TRAIN_BACKUP):
        shutil.copy2(TRAIN_SCRIPT, TRAIN_BACKUP)

    # Run baseline first
    best_bpb = run_baseline()
    if best_bpb is None:
        emit_log("❌ Baseline failed — aborting", "error")
        _cleanup_pid_file()
        return

    baseline_bpb = best_bpb
    experiment_num = 2

    while True:
        # Check shutdown flag
        if _shutdown_requested:
            break

        # Check time budget
        if time.time() >= deadline:
            emit_log(f"⏰ Time budget of {total_time_hours:.1f}h exhausted — stopping loop", "info")
            break

        # Check experiment count (if set)
        if max_experiments > 0 and experiment_num > max_experiments:
            emit_log(f"🔢 Max experiments ({max_experiments}) reached — stopping loop", "info")
            break

        # Restore original train.py from backup before applying a modification
        shutil.copy2(TRAIN_BACKUP, TRAIN_SCRIPT)

        # TODO: Integrate LLM-based code modification here.
        # For now, we run the same baseline (showing the loop structure works).
        # In the real autoresearch loop, an LLM would:
        #   1. Read train_mlx.py
        #   2. Propose a modification (guided by workflow focus/strategy)
        #   3. Write the modified code
        #   4. We train & compare

        commit = generate_commit_hash()
        change = f"Experiment #{experiment_num} (automated modification)"

        emit_log(f"🔬 Starting experiment #{experiment_num}: {change}", "info")

        result, error = run_training()

        if error:
            emit_experiment(experiment_num, commit, change, 0, 0, "crash", False)
            emit_log(f"[Exp #{experiment_num}] {change} — CRASH: {error} ☠️", "error")
            experiment_num += 1
            continue

        if result:
            val_bpb = result.get("valBpb", float("inf"))
            peak_mem = result.get("peakMemoryMb", 0) / 1024

            if val_bpb < best_bpb:
                # Keep improvement
                is_record = True
                status = "keep"
                best_bpb = val_bpb
                # Keep modified train.py (don't restore backup)
                emit_experiment(experiment_num, commit, change, val_bpb, round(peak_mem, 1), status, is_record)
                emit_log(f"[Exp #{experiment_num}] {change} — val_bpb: {val_bpb:.6f} — KEEP ✅ 🎉 New Record!", "success")
            else:
                # Discard regression
                is_record = False
                status = "discard"
                # Restore backup (discard modification)
                shutil.copy2(TRAIN_BACKUP, TRAIN_SCRIPT)
                emit_experiment(experiment_num, commit, change, val_bpb, round(peak_mem, 1), status, is_record)
                emit_log(f"[Exp #{experiment_num}] {change} — val_bpb: {val_bpb:.6f} — DISCARD ❌", "warning")

        experiment_num += 1

    # Summary
    elapsed_hours = (time.time() - start_time) / 3600
    improvement = baseline_bpb - best_bpb
    total_experiments = experiment_num - 1
    emit_log("─────────────────────────────────────────", "info")
    emit_log(f"📊 Run beendet. {total_experiments} Experimente in {elapsed_hours:.1f}h, Beste val_bpb: {best_bpb:.6f} (Δ {-improvement:.4f})", "info")

    # Restore original if we haven't kept any changes
    if os.path.exists(TRAIN_BACKUP):
        os.remove(TRAIN_BACKUP)

    # Cleanup PID file
    _cleanup_pid_file()


if __name__ == "__main__":
    main()
