"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import StatsGrid from "./components/StatsGrid";
import ProgressChart from "./components/ProgressChart";
import ExperimentTable from "./components/ExperimentTable";
import TerminalLog from "./components/TerminalLog";
import DiffViewer from "./components/DiffViewer";
import WorkflowModal from "./components/WorkflowModal";
import EmptyState from "./components/EmptyState";
import HeroSummary from "./components/HeroSummary";
import AutonomyView from "./components/AutonomyView";
import OnboardingFlow from "./components/OnboardingFlow";
import GuidedTour from "./components/GuidedTour";

export default function Home() {
  const [workflows, setWorkflows] = useState([]);
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [experiments, setExperiments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [diffs, setDiffs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bottomTab, setBottomTab] = useState("logs");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [onboarded, setOnboarded] = useState(true); // default true, check on mount
  const [showTour, setShowTour] = useState(false);

  // Track best BPB for record detection across polling cycles
  const previousBestBpb = useRef(null);
  const confettiLoaded = useRef(false);
  const confettiModule = useRef(null);
  const hasRequestedNotificationPermission = useRef(false);

  // Visibility tracking refs for welcome-back
  const lastVisibleTime = useRef(Date.now());
  const experimentCountWhenLeft = useRef(0);
  const keptCountWhenLeft = useRef(0);
  const [welcomeBack, setWelcomeBack] = useState(null);

  // Check onboarding status on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        setOnboarded(localStorage.getItem('autoresearch_onboarded') === 'true');
      } catch {
        // localStorage unavailable (e.g. Safari Private Browsing) — default to onboarded
        setOnboarded(true);
      }
    }
  }, []);

  // Load confetti module dynamically
  useEffect(() => {
    import("canvas-confetti").then(mod => {
      confettiModule.current = mod.default;
      confettiLoaded.current = true;
    }).catch(() => {
      // Confetti not available — non-critical
    });
  }, []);

  // Request notification permission
  useEffect(() => {
    if (!hasRequestedNotificationPermission.current && typeof Notification !== "undefined" && Notification.permission === "default") {
      hasRequestedNotificationPermission.current = true;
      Notification.requestPermission();
    }
  }, []);

  // Dynamic browser tab title
  const currentWorkflow = workflows.find(w => w.id === activeWorkflow);
  const totalExperiments = experiments.length;
  const keptExperiments = experiments.filter(e => e.status === 'keep').length;

  useEffect(() => {
    if (!currentWorkflow) {
      document.title = "AutoResearch Command Center";
      return;
    }
    if (currentWorkflow.status === 'running') {
      document.title = `(🟢 Exp #${totalExperiments + 1}) AutoResearch`;
    } else {
      document.title = "AutoResearch Command Center";
    }
  }, [currentWorkflow?.status, totalExperiments, currentWorkflow]);

  // Page Visibility API — track when user leaves and returns
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User leaving — save current state
        lastVisibleTime.current = Date.now();
        experimentCountWhenLeft.current = totalExperiments;
        keptCountWhenLeft.current = keptExperiments;
      } else {
        // User returning
        const awayMs = Date.now() - lastVisibleTime.current;
        const awayMinutes = awayMs / 1000 / 60;
        const newExps = totalExperiments - experimentCountWhenLeft.current;
        const newKept = keptExperiments - keptCountWhenLeft.current;

        if (awayMinutes >= 5 && newExps > 0) {
          const hours = Math.floor(awayMinutes / 60);
          const mins = Math.floor(awayMinutes % 60);
          const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} Minuten`;

          if (awayMinutes >= 60) {
            // Extended summary for long absence
            setWelcomeBack(
              `☀️ Willkommen zurück! Dein AI-Researcher hat in den letzten ${timeStr} ${newExps} Experimente durchgeführt. ${newKept} Verbesserung${newKept !== 1 ? 'en' : ''} gefunden.`
            );
          } else {
            setWelcomeBack(
              `Willkommen zurück! Während du weg warst: ${newExps} neue Experimente, ${newKept} Verbesserung${newKept !== 1 ? 'en' : ''}.`
            );
          }

          // Auto-close after 6 seconds
          setTimeout(() => setWelcomeBack(null), 6000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [totalExperiments, keptExperiments]);

  // Periodic background notifications (every 30 min when tab is invisible and running)
  useEffect(() => {
    if (!currentWorkflow || currentWorkflow.status !== 'running') return;

    const interval = setInterval(() => {
      if (document.hidden && typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("🧠 AutoResearch läuft", {
          body: `${totalExperiments} Experimente, ${keptExperiments} Verbesserung${keptExperiments !== 1 ? 'en' : ''} bisher.`,
        });
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [currentWorkflow?.status, totalExperiments, keptExperiments, currentWorkflow]);

  // Reset showDetails when workflow stops running
  useEffect(() => {
    if (currentWorkflow && currentWorkflow.status !== 'running') {
      setShowDetails(false);
    }
  }, [currentWorkflow?.status, currentWorkflow]);

  // Show toast for 4 seconds
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fire confetti + notification on new record
  const celebrateRecord = useCallback((newBpb) => {
    // Confetti 🎉
    if (confettiModule.current) {
      confettiModule.current({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#bc8cff', '#58a6ff', '#3fb950', '#e3b341'],
      });
      // Second burst after a short delay
      setTimeout(() => {
        confettiModule.current?.({
          particleCount: 50,
          spread: 120,
          origin: { y: 0.5, x: 0.7 },
          colors: ['#bc8cff', '#58a6ff', '#3fb950'],
        });
      }, 250);
    }

    // Browser notification
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("🏆 Neuer Rekord!", {
        body: `Neuer Bestwert: ${newBpb.toFixed(6)}`,
        icon: "🧠",
      });
    }

    // Toast
    showToast(`🏆 Neuer Rekord! Modellqualität: ${newBpb.toFixed(6)} (besser als zuvor!)`, "success");

    // Temporarily update tab title for 30 seconds
    const prevTitle = document.title;
    document.title = "(🏆) AutoResearch";
    setTimeout(() => {
      if (document.title === "(🏆) AutoResearch") {
        document.title = prevTitle;
      }
    }, 30000);

    // Sound
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      // Play a pleasant chime using the Web Audio API
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.15 + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + i * 0.15);
        osc.stop(audioCtx.currentTime + i * 0.15 + 0.5);
      });
    } catch {
      // Audio not available — non-critical
    }
  }, [showToast]);

  // Seed database on first load, then fetch workflows
  useEffect(() => {
    async function init() {
      try {
        // Seed demo data if DB is empty
        await fetch("/api/seed", { method: "POST" });
        // Fetch workflows
        const res = await fetch("/api/workflows");
        const data = await res.json();
        setWorkflows(data);
        if (data.length > 0) {
          setActiveWorkflow(data[0].id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Fetch experiment data when active workflow changes
  useEffect(() => {
    if (!activeWorkflow) {
      setExperiments([]);
      setLogs([]);
      setDiffs([]);
      previousBestBpb.current = null;
      return;
    }

    async function fetchData() {
      try {
        const res = await fetch(`/api/experiments?workflowId=${activeWorkflow}`);
        const data = await res.json();
        setExperiments(data.experiments || []);
        setLogs(data.logs || []);
        setDiffs(data.diffs || []);

        // Initialize best BPB tracking
        const validExps = (data.experiments || []).filter(e => e.status !== 'crash' && e.valBpb > 0);
        if (validExps.length > 0) {
          previousBestBpb.current = Math.min(...validExps.map(e => e.valBpb));
        }
      } catch (err) {
        console.error("Failed to fetch experiment data:", err);
      }
    }
    fetchData();
  }, [activeWorkflow]);

  // Poll for updates when workflow is running (every 3 seconds)
  useEffect(() => {
    if (!currentWorkflow || currentWorkflow.status !== "running") return;

    const interval = setInterval(async () => {
      try {
        // Refresh experiments
        const res = await fetch(`/api/experiments?workflowId=${activeWorkflow}`);
        const data = await res.json();
        setExperiments(data.experiments || []);
        setLogs(data.logs || []);
        setDiffs(data.diffs || []);

        // Check for new record
        const validExps = (data.experiments || []).filter(e => e.status !== 'crash' && e.valBpb > 0);
        if (validExps.length > 0) {
          const currentBest = Math.min(...validExps.map(e => e.valBpb));
          if (previousBestBpb.current !== null && currentBest < previousBestBpb.current) {
            // New record detected! 🎉
            celebrateRecord(currentBest);
          }
          previousBestBpb.current = currentBest;
        }

        // Refresh workflows (status may have changed)
        const wfRes = await fetch("/api/workflows");
        const wfData = await wfRes.json();
        setWorkflows(wfData);
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeWorkflow, currentWorkflow?.status, celebrateRecord]);

  // Compute stats from experiments
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
      isRecord: !!e.isRecord,
      best: experiments
        .filter(ex => ex.status !== 'crash')
        .slice(0, experiments.filter(ex => ex.status !== 'crash').indexOf(e) + 1)
        .reduce((min, ex) => ex.valBpb < min ? ex.valBpb : min, Infinity),
    }));

  const handleCreateWorkflow = async (workflow) => {
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflow),
      });
      const newWorkflow = await res.json();
      setWorkflows(prev => [newWorkflow, ...prev]);
      setActiveWorkflow(newWorkflow.id);
      setShowModal(false);
      setEditingWorkflow(null);
    } catch (err) {
      console.error("Failed to create workflow:", err);
    }
  };

  const handleUpdateWorkflow = async (workflow) => {
    try {
      const res = await fetch("/api/workflows", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflow),
      });
      if (res.ok) {
        // Refresh workflows
        const wfRes = await fetch("/api/workflows");
        setWorkflows(await wfRes.json());
        setShowModal(false);
        setEditingWorkflow(null);
        showToast("✅ Workflow aktualisiert", "success");
      }
    } catch (err) {
      console.error("Failed to update workflow:", err);
    }
  };

  const handleDeleteWorkflow = async (id) => {
    try {
      await fetch(`/api/workflows?id=${id}`, { method: "DELETE" });
      setWorkflows(prev => prev.filter(w => w.id !== id));
      if (activeWorkflow === id) {
        const remaining = workflows.filter(w => w.id !== id);
        setActiveWorkflow(remaining[0]?.id || null);
      }
      showToast("🗑️ Workflow gelöscht", "info");
    } catch (err) {
      console.error("Failed to delete workflow:", err);
    }
  };

  const handleDuplicateWorkflow = async (wf) => {
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${wf.name} (Kopie)`,
          focus: wf.focus,
          strategy: wf.strategy,
          target: wf.target,
          timeBudget: wf.timeBudget,
          instructions: wf.instructions || '',
        }),
      });
      const newWorkflow = await res.json();
      setWorkflows(prev => [newWorkflow, ...prev]);
      setActiveWorkflow(newWorkflow.id);
      showToast("📋 Workflow dupliziert", "success");
    } catch (err) {
      console.error("Failed to duplicate workflow:", err);
    }
  };

  const handleEditWorkflow = (wf) => {
    setEditingWorkflow(wf);
    setShowModal(true);
  };

  const handleStartWorkflow = async () => {
    if (!activeWorkflow) return;
    try {
      const res = await fetch("/api/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", workflowId: activeWorkflow }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === "CLOUD_NOT_IMPLEMENTED") {
          showToast("☁️ Cloud execution (Modal) ist noch nicht implementiert. Bitte nutze den Local-Modus.", "warning");
        } else {
          showToast(`❌ ${data.error}`, "error");
        }
        return;
      }

      // Refresh workflows to get updated status
      const wfRes = await fetch("/api/workflows");
      setWorkflows(await wfRes.json());
      showToast("▶ Training gestartet!", "success");
    } catch (err) {
      console.error("Failed to start workflow:", err);
      showToast("❌ Fehler beim Starten", "error");
    }
  };

  const handleStopWorkflow = async () => {
    if (!activeWorkflow) return;
    try {
      await fetch("/api/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop", workflowId: activeWorkflow }),
      });
      const res = await fetch("/api/workflows");
      setWorkflows(await res.json());
      showToast("⏹ Training gestoppt", "info");
    } catch (err) {
      console.error("Failed to stop workflow:", err);
    }
  };

  const handleExport = async () => {
    if (!activeWorkflow || !currentWorkflow) return;
    try {
      const res = await fetch(`/api/experiments?workflowId=${activeWorkflow}`);
      const data = await res.json();
      const exps = data.experiments || [];

      if (exps.length === 0) {
        showToast("📤 Keine Experimente zum Exportieren", "warning");
        return;
      }

      // Generate CSV
      const headers = ["#", "Commit", "Änderung", "val_bpb", "Peak Memory (GB)", "Status", "Record"];
      const rows = exps.map(e => [
        e.id,
        e.commitHash || "",
        `"${(e.change || "").replace(/"/g, '""')}"`,
        e.status === "crash" ? "" : e.valBpb?.toFixed(6),
        e.status === "crash" ? "" : e.peakMemory?.toFixed(1),
        e.status,
        e.isRecord ? "yes" : "",
      ]);

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

      // Add summary at the end
      const validExps = exps.filter(e => e.status !== "crash" && e.valBpb > 0);
      const best = validExps.length > 0 ? Math.min(...validExps.map(e => e.valBpb)) : 0;
      const summaryLines = [
        "",
        "# Summary",
        `# Workflow: ${currentWorkflow.name}`,
        `# Gesamt: ${exps.length}`,
        `# Bestwert: ${best > 0 ? best.toFixed(6) : "N/A"}`,
        `# Erfolgsrate: ${keepRate}%`,
        `# Strategie: ${currentWorkflow.strategy}`,
        `# Ziel: ${currentWorkflow.target}`,
      ];
      const fullCsv = csvContent + "\n" + summaryLines.join("\n");

      // Trigger download
      const blob = new Blob([fullCsv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentWorkflow.name.replace(/[^a-zA-Z0-9]/g, "_")}_experiments.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("📤 CSV exportiert!", "success");
    } catch (err) {
      console.error("Export failed:", err);
      showToast("❌ Export fehlgeschlagen", "error");
    }
  };

  if (loading) {
    return (
      <div className="appLayout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--fg-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧠</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>Initializing AutoResearch...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appLayout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--accent-red)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{error}</div>
        </div>
      </div>
    );
  }

  const isRunning = currentWorkflow?.status === 'running';
  const showAutonomyView = isRunning && !showDetails;

  return (
    <div className="appLayout">
      {/* Visually hidden h1 for accessibility */}
      <h1 className="sr-only">AutoResearch Command Center</h1>

      <Sidebar
        workflows={workflows}
        activeWorkflow={activeWorkflow}
        onSelectWorkflow={(id) => { setActiveWorkflow(id); setSidebarOpen(false); }}
        onNewWorkflow={() => { setEditingWorkflow(null); setShowModal(true); }}
        onDeleteWorkflow={handleDeleteWorkflow}
        onDuplicateWorkflow={handleDuplicateWorkflow}
        onEditWorkflow={handleEditWorkflow}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="mainContent">
        <TopBar
          workflow={currentWorkflow}
          onMenuClick={() => setSidebarOpen(true)}
          onStart={handleStartWorkflow}
          onStop={handleStopWorkflow}
          onExport={handleExport}
        />

        <div className="contentArea">
          {/* Onboarding for brand new users */}
          {!currentWorkflow && workflows.length === 0 && !onboarded ? (
            <OnboardingFlow
              onCreateWorkflow={() => {
                try { localStorage.setItem('autoresearch_onboarded', 'true'); } catch { /* ignore */ }
                setOnboarded(true);
                setShowModal(true);
              }}
              onSkip={() => {
                try { localStorage.setItem('autoresearch_onboarded', 'true'); } catch { /* ignore */ }
                setOnboarded(true);
              }}
              onStartDemo={async () => {
                try { localStorage.setItem('autoresearch_onboarded', 'true'); } catch { /* ignore */ }
                setOnboarded(true);
                // Create demo workflow + seed data
                try {
                  const res = await fetch('/api/demo', { method: 'POST' });
                  if (res.ok) {
                    const { workflowId } = await res.json();
                    await fetchWorkflows();
                    setActiveWorkflow(workflowId);
                    showToast('🧪 Demo geladen! Schau dich um.', 'success');
                    // Delay tour slightly so UI renders
                    setTimeout(() => setShowTour(true), 600);
                  }
                } catch {
                  showToast('Demo konnte nicht geladen werden', 'error');
                }
              }}
            />
          ) : !currentWorkflow ? (
            <EmptyState onCreateWorkflow={() => setShowModal(true)} />
          ) : showAutonomyView ? (
            /* Autonomy "Sleep Mode" View when running */
            <AutonomyView
              totalExperiments={totalExperiments}
              keptExperiments={keptExperiments}
              bestBpb={bestBpb}
              improvement={improvement}
              workflowName={currentWorkflow.name}
              timeBudget={currentWorkflow.timeBudget || 300}
              startedAt={currentWorkflow.startedAt}
              onShowDetails={() => setShowDetails(true)}
            />
          ) : (
            <>
              {/* Hero Summary — The "Morning Briefing" */}
              <HeroSummary
                totalExperiments={totalExperiments}
                keptExperiments={keptExperiments}
                improvement={improvement}
                bestBpb={bestBpb}
                status={currentWorkflow.status}
                workflowName={currentWorkflow.name}
                currentExperimentNumber={totalExperiments + 1}
              />

              <div data-tour="stats">
              <StatsGrid
                totalExperiments={totalExperiments}
                bestBpb={bestBpb}
                improvement={improvement}
                keepRate={keepRate}
                status={currentWorkflow.status}
              />
              </div>

              <div className="contentGrid" data-tour="chart">
                <div className="card">
                  <div className="cardHeader">
                    <span className="cardTitle">📈 Modellqualität über Zeit</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--fg-subtle)' }}>
                      Niedriger = besser
                    </span>
                  </div>
                  <div className="cardBody">
                    <ProgressChart data={chartData} />
                  </div>
                </div>
              </div>

              <div className="card" data-tour="table">
                <div className="cardHeader">
                  <span className="cardTitle">🧪 Experimente</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ExperimentSearch
                      onSearch={(query) => {
                        // Filter placeholder for future
                      }}
                    />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--fg-subtle)' }}>
                      {totalExperiments} gesamt
                    </span>
                  </div>
                </div>
                <div className="tableScroll">
                  <ExperimentTable experiments={experiments} diffs={diffs} />
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

                <div className="card" data-tour="report">
                  <div className="cardHeader">
                    <span className="cardTitle">📊 Bericht</span>
                  </div>
                  <div className="cardBody">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <ReportRow label="Workflow" value={currentWorkflow.name} />
                      <ReportRow label="Status" value={currentWorkflow.status === 'completed' ? '✅ Abgeschlossen' : currentWorkflow.status === 'running' ? '🟢 Läuft' : '⏸️ Bereit'} />
                      <ReportRow label="Gesamt" value={totalExperiments.toString()} mono />
                      <ReportRow label="Startwert" value={baselineBpb.toFixed(6)} mono />
                      <ReportRow label="Bestwert" value={bestBpb < Infinity ? bestBpb.toFixed(6) : '—'} mono highlight />
                      <ReportRow label="Verbesserung" value={improvement > 0 ? `Δ -${improvement.toFixed(6)}` : '—'} mono highlight />
                      <ReportRow label="Erfolgsrate" value={`${keepRate}%`} mono />
                      <ReportRow label="Ziel" value={currentWorkflow.target === 'local' ? '🏠 Lokal (Mac)' : '☁️ Cloud (Modal)'} />
                      <ReportRow label="Strategie" value={currentWorkflow.strategy === 'conservative' ? '🎯 Konservativ' : currentWorkflow.strategy === 'aggressive' ? '🚀 Aggressiv' : '⚖️ Balanced'} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Show details toggle when returning from autonomy */}
              {isRunning && showDetails && (
                <div style={{ textAlign: 'center', marginTop: '-8px' }}>
                  <button className="autonomyToggle" onClick={() => setShowDetails(false)}>
                    💤 Zurück zur Übersicht
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showModal && (
        <WorkflowModal
          onClose={() => { setShowModal(false); setEditingWorkflow(null); }}
          onCreate={handleCreateWorkflow}
          onUpdate={handleUpdateWorkflow}
          editWorkflow={editingWorkflow}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert" aria-live="polite">
          {toast.message}
        </div>
      )}

      {/* Welcome back overlay */}
      {welcomeBack && (
        <div className="welcomeBack" onClick={() => setWelcomeBack(null)}>
          {welcomeBack}
        </div>
      )}

    {/* Guided Tour Overlay */}
    {showTour && (
      <GuidedTour
        onComplete={() => {
          setShowTour(false);
          showToast('🎉 Tour abgeschlossen! Erstelle jetzt deinen ersten Workflow.', 'success');
        }}
        onSkip={() => setShowTour(false)}
      />
    )}
  </div>
  );
}

function ExperimentSearch({ onSearch }) {
  const [query, setQuery] = useState('');
  return null; // Placeholder for future search — structure exists for P-015
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
