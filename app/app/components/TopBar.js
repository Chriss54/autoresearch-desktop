"use client";

export default function TopBar({ workflow, onMenuClick }) {
  const getStatusBadge = () => {
    if (!workflow) return null;
    const cls = workflow.status === 'running' ? 'running' :
                workflow.status === 'completed' ? 'completed' : 'idle';
    const label = workflow.status === 'running' ? '● Running' :
                  workflow.status === 'completed' ? '✓ Completed' : '○ Idle';
    return <span className={`topBarBadge ${cls}`}>{label}</span>;
  };

  return (
    <header className="topBar">
      <div className="topBarLeft">
        <button className="mobileMenuBtn" onClick={onMenuClick} aria-label="Menu">☰</button>
        <span className="topBarTitle">{workflow?.name || 'AutoResearch'}</span>
        {getStatusBadge()}
      </div>

      <div className="topBarRight">
        <button className="btn btnPrimary" id="btn-start-run" disabled={!workflow || workflow?.status === 'running'}>
          ▶ Start
        </button>
        <button className="btn btnDanger" id="btn-stop-run" disabled={!workflow || workflow?.status !== 'running'}>
          ⏹ Stop
        </button>
        <button className="btn btnOutline" id="btn-export" disabled={!workflow}>
          📤 Export
        </button>
      </div>
    </header>
  );
}
