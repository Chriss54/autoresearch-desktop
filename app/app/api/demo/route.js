/**
 * /api/demo — Creates a demo workflow with seed experiment data
 * Used by the onboarding flow "Probier's aus" step
 */
const db = require("../../../lib/database");

export async function POST() {
  try {
    // Create demo workflow
    const workflow = db.createWorkflow({
      name: "🧪 Demo: Architecture Sweep",
      focus: "architecture",
      strategy: "balanced",
      target: "local",
      timeBudget: 5,
      instructions: "Demo-Workflow mit vorgenerierten Experiment-Daten.",
    });

    // Seed 12 realistic experiments
    const demoExperiments = [
      { num: 1, commit: "a1b2c3d", change: "Baseline (original train.py)", valBpb: 1.4823, peakMem: 4.2, status: "keep", isRecord: false },
      { num: 2, commit: "e4f5g6h", change: "n_head 6→8, leicht mehr Kapazität", valBpb: 1.4756, peakMem: 4.5, status: "keep", isRecord: true },
      { num: 3, commit: "i7j8k9l", change: "4× MLP expansion → 3× (weniger Params)", valBpb: 1.4901, peakMem: 3.8, status: "discard", isRecord: false },
      { num: 4, commit: "m0n1o2p", change: "SSSL → SLSL Window-Pattern", valBpb: 1.4712, peakMem: 4.5, status: "keep", isRecord: true },
      { num: 5, commit: "q3r4s5t", change: "Learning rate 0.04→0.06 (aggressiver)", valBpb: 1.4950, peakMem: 4.5, status: "discard", isRecord: false },
      { num: 6, commit: "u6v7w8x", change: "Depth 4→6, mehr Transformer-Schichten", valBpb: 1.4589, peakMem: 6.1, status: "keep", isRecord: true },
      { num: 7, commit: "y9z0a1b", change: "Weight decay 0.2→0.1", valBpb: 1.4623, peakMem: 6.1, status: "discard", isRecord: false },
      { num: 8, commit: "c2d3e4f", change: "RoPE base 10000→50000", valBpb: 1.4801, peakMem: 6.1, status: "discard", isRecord: false },
      { num: 9, commit: "g5h6i7j", change: "AdamW β₁ 0.8→0.9", valBpb: 1.4567, peakMem: 6.1, status: "keep", isRecord: true },
      { num: 10, commit: "k8l9m0n", change: "Sequence length 2048→4096", valBpb: 1.5200, peakMem: 11.2, status: "crash", isRecord: false },
      { num: 11, commit: "o1p2q3r", change: "Seq 2048 + GQA (n_kv_head=2)", valBpb: 1.4534, peakMem: 5.8, status: "keep", isRecord: true },
      { num: 12, commit: "s4t5u6v", change: "Warmup 0%→5%, stabilerer Start", valBpb: 1.4498, peakMem: 5.8, status: "keep", isRecord: true },
    ];

    for (const exp of demoExperiments) {
      db.createExperiment({
        workflowId: workflow.id,
        commitHash: exp.commit,
        change: exp.change,
        valBpb: exp.valBpb,
        peakMemory: exp.peakMem,
        status: exp.status,
        isRecord: exp.isRecord,
      });
    }

    // Add some demo logs
    db.addLog({ workflowId: workflow.id, text: "🚀 Experiment Loop gestartet — Workflow: Demo: Architecture Sweep", type: "info" });
    db.addLog({ workflowId: workflow.id, text: "🧠 Model: 3.2M params, DEPTH=4, dim=256", type: "info" });
    db.addLog({ workflowId: workflow.id, text: "[Exp #1] Baseline — val_bpb: 1.482300 — KEEP ✅", type: "success" });
    db.addLog({ workflowId: workflow.id, text: "[Exp #6] Depth 4→6 — val_bpb: 1.458900 — KEEP ✅ 🎉 New Record!", type: "success" });
    db.addLog({ workflowId: workflow.id, text: "[Exp #12] Warmup 5% — val_bpb: 1.449800 — KEEP ✅ 🎉 New Record!", type: "success" });
    db.addLog({ workflowId: workflow.id, text: "📊 Run beendet. 12 Experimente in 1.0h, Beste val_bpb: 1.449800", type: "info" });

    // Set workflow to completed
    db.updateWorkflowStatus(workflow.id, "completed");

    return Response.json({ workflowId: workflow.id, experiments: demoExperiments.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
