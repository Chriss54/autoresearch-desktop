/**
 * /api/modal — Modal cloud status endpoint
 * Returns auth status, credits info, and running apps
 */
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

export async function GET() {
  try {
    const engineDir = path.resolve(process.cwd(), "..", "engine");

    // Check if Modal is authenticated
    let authenticated = false;
    let workspace = null;
    const modalToml = path.join(process.env.HOME || "~", ".modal.toml");
    if (fs.existsSync(modalToml)) {
      const content = fs.readFileSync(modalToml, "utf8");
      authenticated = content.includes("token_id");
      // Extract workspace/profile name
      const match = content.match(/\[([^\]]+)\]/);
      if (match) workspace = match[1];
    }

    // Try to get app list from Modal
    let apps = [];
    let tokenValid = false;
    if (authenticated) {
      try {
        const result = execSync("uv run modal app list 2>/dev/null", {
          cwd: engineDir,
          encoding: "utf-8",
          timeout: 15000,
        });
        tokenValid = true;
        // Parse app list (basic text parsing)
        const lines = result.split("\n").filter(l => l.trim() && !l.startsWith("─") && !l.startsWith("│") && !l.includes("App Id"));
        for (const line of lines) {
          const parts = line.split(/\s{2,}/).map(s => s.trim()).filter(Boolean);
          if (parts.length >= 2) {
            apps.push({ name: parts[0], id: parts[1] });
          }
        }
      } catch {
        // Modal CLI not available or token invalid
        tokenValid = false;
      }
    }

    return Response.json({
      authenticated,
      tokenValid,
      workspace,
      apps,
      gpu: "T4",
      estimatedCostPerHour: 0.59,
      status: authenticated && tokenValid ? "ready" : "not_configured",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
