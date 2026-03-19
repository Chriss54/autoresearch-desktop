/**
 * /api/workflows — Workflow CRUD
 */
const db = require("../../../lib/database");

export async function GET() {
  try {
    const workflows = db.getWorkflows();
    return Response.json(workflows);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, focus, strategy, target, timeBudget, instructions } = body;
    if (!name || !name.trim()) {
      return Response.json({ error: "Workflow name is required" }, { status: 400 });
    }
    const workflow = db.createWorkflow({ name: name.trim(), focus, strategy, target, timeBudget, instructions });
    return Response.json(workflow, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return Response.json({ error: "Workflow id is required" }, { status: 400 });
    }
    db.deleteWorkflow(id);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, name, focus, strategy, target, timeBudget, instructions, status } = body;
    if (!id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }
    // Full update or status-only update
    if (name) {
      const workflow = db.updateWorkflow({ id, name, focus, strategy, target, timeBudget, instructions });
      return Response.json(workflow);
    } else if (status) {
      const workflow = db.updateWorkflowStatus(id, status);
      return Response.json(workflow);
    } else {
      return Response.json({ error: "name or status is required" }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

