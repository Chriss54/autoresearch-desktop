"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import StatsGrid from "./components/StatsGrid";
import ProgressChart from "./components/ProgressChart";
import ExperimentTable from "./components/ExperimentTable";
import TerminalLog from "./components/TerminalLog";
import DiffViewer from "./components/DiffViewer";
import WorkflowModal from "./components/WorkflowModal";
import EmptyState from "./components/EmptyState";

// ---- Demo data to showcase the dashboard ----
const DEMO_WORKFLOWS = [
  { id: "wf-1", name: "Nacht-Run: Konservativ", status: "completed", focus: "architecture", strategy: "conservative", target: "local", timeBudget: 5, experiments: 96 },
  { id: "wf-2", name: "Moonshot: Radikal", status: "idle", focus: "all", strategy: "aggressive", target: "cloud", timeBudget: 5, experiments: 0 },
  { id: "wf-3", name: "Hyperparameter Sweep", status: "idle", focus: "hyperparameters", strategy: "conservative", target: "local", timeBudget: 5, experiments: 0 },
];

const DEMO_EXPERIMENTS = [
  { id: 1, commit: "a1b2c3d", change: "Baseline (original train.py)", valBpb: 1.8529, peakMemory: 8.2, status: "keep", timestamp: Date.now() - 3600000 * 10, isRecord: false },
  { id: 2, commit: "b2c3d4e", change: "Reduce DEPTH from 4 to 3", valBpb: 1.8891, peakMemory: 6.1, status: "discard", timestamp: Date.now() - 3600000 * 9.9, isRecord: false },
  { id: 3, commit: "c3d4e5f", change: "Lower TOTAL_BATCH_SIZE to 2^15", valBpb: 1.8302, peakMemory: 7.8, status: "keep", timestamp: Date.now() - 3600000 * 9.8, isRecord: true },
  { id: 4, commit: "d4e5f6g", change: "Increase LR to 0.06", valBpb: 1.8445, peakMemory: 8.2, status: "discard", timestamp: Date.now() - 3600000 * 9.7, isRecord: false },
  { id: 5, commit: "e5f6g7h", change: "Switch to WINDOW_PATTERN='L'", valBpb: 1.8105, peakMemory: 8.4, status: "keep", timestamp: Date.now() - 3600000 * 9.6, isRecord: true },
  { id: 6, commit: "f6g7h8i", change: "Double model width (OOM)", valBpb: 0, peakMemory: 0, status: "crash", timestamp: Date.now() - 3600000 * 9.5, isRecord: false },
  { id: 7, commit: "g7h8i9j", change: "Add weight decay 0.3", valBpb: 1.8201, peakMemory: 8.2, status: "discard", timestamp: Date.now() - 3600000 * 9.4, isRecord: false },
  { id: 8, commit: "h8i9j0k", change: "Reduce HEAD_DIM to 64", valBpb: 1.8077, peakMemory: 7.9, status: "keep", timestamp: Date.now() - 3600000 * 9.3, isRecord: true },
  { id: 9, commit: "i9j0k1l", change: "Increase EMBEDDING_LR to 0.8", valBpb: 1.8155, peakMemory: 7.9, status: "discard", timestamp: Date.now() - 3600000 * 9.2, isRecord: false },
  { id: 10, commit: "j0k1l2m", change: "ASPECT_RATIO 48, DEPTH 6", valBpb: 1.7944, peakMemory: 7.1, status: "keep", timestamp: Date.now() - 3600000 * 9.1, isRecord: true },
  { id: 11, commit: "k1l2m3n", change: "Remove value embeddings", valBpb: 1.8312, peakMemory: 6.5, status: "discard", timestamp: Date.now() - 3600000 * 9.0, isRecord: false },
  { id: 12, commit: "l2m3n4o", change: "Warmup ratio 0.05 + warmdown 0.6", valBpb: 1.7891, peakMemory: 7.1, status: "keep", timestamp: Date.now() - 3600000 * 8.9, isRecord: true },
];

const DEMO_LOGS = [
  { text: "🚀 Experiment Loop gestartet — Workflow: Nacht-Run: Konservativ", type: "info" },
  { text: "[Exp #1] Baseline — val_bpb: 1.852900, peak_mem: 8.2GB — KEEP ✅", type: "success" },
  { text: "[Exp #2] Reduce DEPTH from 4 to 3 — val_bpb: 1.889100 — DISCARD ❌", type: "warning" },
  { text: "[Exp #3] Lower TOTAL_BATCH_SIZE to 2^15 — val_bpb: 1.830200 — KEEP ✅ 🎉 New Record!", type: "success" },
  { text: "[Exp #4] Increase LR to 0.06 — val_bpb: 1.844500 — DISCARD ❌", type: "warning" },
  { text: "[Exp #5] Switch to WINDOW_PATTERN='L' — val_bpb: 1.810500 — KEEP ✅ 🎉 New Record!", type: "success" },
  { text: "[Exp #6] Double model width — CRASH: RuntimeError: MPS backend out of memory ☠️", type: "error" },
  { text: "[Exp #7] Add weight decay 0.3 — val_bpb: 1.820100 — DISCARD ❌", type: "warning" },
  { text: "[Exp #8] Reduce HEAD_DIM to 64 — val_bpb: 1.807700 — KEEP ✅ 🎉 New Record!", type: "success" },
  { text: "[Exp #9] Increase EMBEDDING_LR to 0.8 — val_bpb: 1.815500 — DISCARD ❌", type: "warning" },
  { text: "[Exp #10] ASPECT_RATIO 48, DEPTH 6 — val_bpb: 1.794400 — KEEP ✅ 🎉 New Record!", type: "success" },
  { text: "[Exp #11] Remove value embeddings — val_bpb: 1.831200 — DISCARD ❌", type: "warning" },
  { text: "[Exp #12] Warmup ratio 0.05 + warmdown 0.6 — val_bpb: 1.789100 — KEEP ✅ 🎉 New Record!", type: "success" },
  { text: "─────────────────────────────────────────", type: "info" },
  { text: "📊 Run beendet. 12 Experimente, Beste val_bpb: 1.789100 (Δ -0.0638)", type: "info" },
];

const DEMO_DIFF = [
  { type: "context", text: "# Model architecture" },
  { type: "removed", text: "ASPECT_RATIO = 64" },
  { type: "added",   text: "ASPECT_RATIO = 48" },
  { type: "context", text: "HEAD_DIM = 128" },
  { type: "removed", text: 'WINDOW_PATTERN = "SSSL"' },
  { type: "added",   text: 'WINDOW_PATTERN = "L"' },
  { type: "context", text: "" },
  { type: "context", text: "# Model size" },
  { type: "removed", text: "DEPTH = 4" },
  { type: "added",   text: "DEPTH = 6" },
  { type: "context", text: "DEVICE_BATCH_SIZE = 16" },
  { type: "context", text: "" },
  { type: "context", text: "# Optimization" },
  { type: "removed", text: "WARMUP_RATIO = 0.0" },
  { type: "added",   text: "WARMUP_RATIO = 0.05" },
  { type: "removed", text: "WARMDOWN_RATIO = 0.5" },
  { type: "added",   text: "WARMDOWN_RATIO = 0.6" },
];


export default function Home() {
  const [workflows, setWorkflows] = useState(DEMO_WORKFLOWS);
  const [activeWorkflow, setActiveWorkflow] = useState("wf-1");
  const [experiments, setExperiments] = useState(DEMO_EXPERIMENTS);
  const [logs, setLogs] = useState(DEMO_LOGS);
  const [diffs, setDiffs] = useState(DEMO_DIFF);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bottomTab, setBottomTab] = useState("logs"); // 'logs' | 'diff'

  const currentWorkflow = workflows.find(w => w.id === activeWorkflow);

  // Compute stats
  const totalExperiments = experiments.length;
  const bestBpb = experiments.filter(e => e.status !== 'crash').reduce((min, e) => e.valBpb < min && e.valBpb > 0 ? e.valBpb : min, Infinity);
  const baselineBpb = experiments.length > 0 ? experiments[0].valBpb : 0;
  const improvement = baselineBpb > 0 && bestBpb < Infinity ? baselineBpb - bestBpb : 0;
  const keepRate = experiments.length > 0 ? Math.round((experiments.filter(e => e.status === 'keep').length / experiments.length) * 100) : 0;

  // Chart data — val_bpb over experiments (only non-crash)
  const chartData = experiments
    .filter(e => e.status !== 'crash')
    .map((e, idx) => ({
      experiment: idx + 1,
      valBpb: e.valBpb,
      isRecord: e.isRecord,
      best: experiments
        .filter(ex => ex.status !== 'crash')
        .slice(0, experiments.filter(ex => ex.status !== 'crash').indexOf(e) + 1)
        .reduce((min, ex) => ex.valBpb < min ? ex.valBpb : min, Infinity),
    }));

  const handleCreateWorkflow = (workflow) => {
    const newWorkflow = {
      id: `wf-${Date.now()}`,
      ...workflow,
      status: "idle",
      experiments: 0,
    };
    setWorkflows(prev => [...prev, newWorkflow]);
    setActiveWorkflow(newWorkflow.id);
    setShowModal(false);
  };

  const handleDeleteWorkflow = (id) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
    if (activeWorkflow === id) {
      setActiveWorkflow(workflows[0]?.id || null);
    }
  };

  return (
    <div className="appLayout">
      <Sidebar
        workflows={workflows}
        activeWorkflow={activeWorkflow}
        onSelectWorkflow={(id) => { setActiveWorkflow(id); setSidebarOpen(false); }}
        onNewWorkflow={() => setShowModal(true)}
        onDeleteWorkflow={handleDeleteWorkflow}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="mainContent">
        <TopBar
          workflow={currentWorkflow}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="contentArea">
          {currentWorkflow ? (
            <>
              <StatsGrid
                totalExperiments={totalExperiments}
                bestBpb={bestBpb}
                improvement={improvement}
                keepRate={keepRate}
                status={currentWorkflow.status}
              />

              <div className="contentGrid">
                <div className="card">
                  <div className="cardHeader">
                    <span className="cardTitle">📈 val_bpb Progress</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--fg-subtle)' }}>
                      Lower is better
                    </span>
                  </div>
                  <div className="cardBody">
                    <ProgressChart data={chartData} />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="cardHeader">
                  <span className="cardTitle">🧪 Experiments</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--fg-subtle)' }}>
                    {totalExperiments} total
                  </span>
                </div>
                <div className="tableScroll">
                  <ExperimentTable experiments={experiments} />
                </div>
              </div>

              <div className="bottomPanels">
                <div className="card">
                  <div className="cardHeader">
                    <div className="tabs" style={{ borderBottom: 'none' }}>
                      <button
                        className={`tab ${bottomTab === 'logs' ? 'active' : ''}`}
                        onClick={() => setBottomTab('logs')}
                      >
                        💻 Live Terminal
                      </button>
                      <button
                        className={`tab ${bottomTab === 'diff' ? 'active' : ''}`}
                        onClick={() => setBottomTab('diff')}
                      >
                        📝 Code Diff
                      </button>
                    </div>
                  </div>
                  <div className="cardBody" style={{ padding: 0 }}>
                    {bottomTab === 'logs' ? (
                      <TerminalLog logs={logs} />
                    ) : (
                      <DiffViewer diffs={diffs} />
                    )}
                  </div>
                </div>

                <div className="card">
                  <div className="cardHeader">
                    <span className="cardTitle">📊 Run Report</span>
                  </div>
                  <div className="cardBody">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <ReportRow label="Workflow" value={currentWorkflow.name} />
                      <ReportRow label="Status" value={currentWorkflow.status === 'completed' ? '✅ Completed' : currentWorkflow.status === 'running' ? '🟢 Running' : '⏸️ Idle'} />
                      <ReportRow label="Total Experiments" value={totalExperiments.toString()} mono />
                      <ReportRow label="Baseline val_bpb" value={baselineBpb.toFixed(6)} mono />
                      <ReportRow label="Best val_bpb" value={bestBpb < Infinity ? bestBpb.toFixed(6) : '—'} mono highlight />
                      <ReportRow label="Improvement" value={improvement > 0 ? `Δ -${improvement.toFixed(6)}` : '—'} mono highlight />
                      <ReportRow label="Keep Rate" value={`${keepRate}%`} mono />
                      <ReportRow label="Target" value={currentWorkflow.target === 'local' ? '🏠 Lokal (Mac)' : '☁️ Cloud (Modal)'} />
                      <ReportRow label="Strategy" value={currentWorkflow.strategy === 'conservative' ? '🎯 Konservativ' : '🚀 Aggressiv'} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyState onCreateWorkflow={() => setShowModal(true)} />
          )}
        </div>
      </main>

      {showModal && (
        <WorkflowModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateWorkflow}
        />
      )}
    </div>
  );
}

function ReportRow({ label, value, mono, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '12px', color: 'var(--fg-subtle)', fontWeight: 500 }}>{label}</span>
      <span style={{
        fontSize: '13px',
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
        fontWeight: highlight ? 700 : 500,
        color: highlight ? 'var(--accent-green)' : 'var(--fg-default)',
      }}>
        {value}
      </span>
    </div>
  );
}
