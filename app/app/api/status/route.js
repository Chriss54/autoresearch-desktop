/**
 * /api/status — System status (memory, chip info, running processes)
 */
const { execSync } = require("child_process");
const os = require("os");

export async function GET() {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpus = os.cpus();

    // Get Apple Silicon chip info
    let chipInfo = "Unknown";
    try {
      chipInfo = execSync("sysctl -n machdep.cpu.brand_string", { encoding: "utf-8" }).trim();
    } catch {
      chipInfo = cpus[0]?.model || "Unknown CPU";
    }

    // Get MLX availability check
    let mlxAvailable = false;
    try {
      execSync("python3 -c 'import mlx'", { encoding: "utf-8" });
      mlxAvailable = true;
    } catch {
      mlxAvailable = false;
    }

    // Get unified memory info on Apple Silicon
    let unifiedMemoryGB = (totalMem / (1024 ** 3)).toFixed(0);

    return Response.json({
      chip: chipInfo,
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        totalGB: (totalMem / (1024 ** 3)).toFixed(1),
        usedGB: (usedMem / (1024 ** 3)).toFixed(1),
        freeGB: (freeMem / (1024 ** 3)).toFixed(1),
        usagePercent: Math.round((usedMem / totalMem) * 100),
      },
      mlxAvailable,
      platform: {
        arch: os.arch(),
        platform: os.platform(),
        hostname: os.hostname(),
        uptime: os.uptime(),
        cores: cpus.length,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
