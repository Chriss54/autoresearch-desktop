/**
 * /api/experiments — Experiment data API
 */
const db = require("../../../lib/database");

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get("workflowId");
    if (!workflowId) {
      return Response.json({ error: "workflowId is required" }, { status: 400 });
    }
    const experiments = db.getExperiments(workflowId);
    // Also return logs and diffs for this workflow
    const logs = db.getLogs(workflowId);
    const diffs = db.getDiffs(workflowId);
    return Response.json({ experiments, logs, diffs });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { workflowId, commitHash, change, valBpb, peakMemory, status, isRecord } = body;
    if (!workflowId) {
      return Response.json({ error: "workflowId is required" }, { status: 400 });
    }
    const experiment = db.createExperiment({ workflowId, commitHash, change, valBpb, peakMemory, status, isRecord });
    return Response.json(experiment, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
