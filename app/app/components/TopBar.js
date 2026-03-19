"use client";

export default function TopBar({ workflow, onMenuClick, onStart, onStop, onExport }) {
  const getStatusBadge = () => {
    if (!workflow) return null;
    const cls = workflow.status === 'running' ? 'running' :
                workflow.status === 'completed' ? 'completed' : 'idle';
    const label = workflow.status === 'running' ? '● Läuft' :
                  workflow.status === 'completed' ? '✓ Abgeschlossen' : '○ Bereit';
    return <span className={`topBarBadge ${cls}`}>{label}</span>;
  };

  const getTargetBadge = () => {
    if (!workflow) return null;
    if (workflow.target === 'cloud') {
      return <span className="topBarBadge cloud" title="NVIDIA T4 GPU via Modal">☁️ Cloud</span>;
    }
    return <span className="topBarBadge local" title="Apple Silicon (MLX)">🏠 Lokal</span>;
  };

  return (
    <header className="topBar">
      <div className="topBarLeft">
        <button className="mobileMenuBtn" onClick={onMenuClick} aria-label="Toggle navigation menu">☰</button>
        <span className="topBarTitle">{workflow?.name || 'AutoResearch'}</span>
        {getStatusBadge()}
        {getTargetBadge()}
      </div>

      <div className="topBarRight">
        <button className="btn btnPrimary" id="btn-start-run" data-tour="start" disabled={!workflow || workflow?.status === 'running'} onClick={onStart}>
          ▶ Start
        </button>
        <button className="btn btnDanger" id="btn-stop-run" disabled={!workflow || workflow?.status !== 'running'} onClick={onStop}>
          ⏹ Stop
        </button>
        <button className="btn btnOutline" id="btn-export" disabled={!workflow} onClick={onExport} aria-label="Export experiment data">
          📤 Export
        </button>
      </div>
    </header>
  );
}
