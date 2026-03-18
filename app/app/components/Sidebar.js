"use client";

export default function Sidebar({ workflows, activeWorkflow, onSelectWorkflow, onNewWorkflow, onDeleteWorkflow, isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 99, display: 'none',
          }}
          className="mobileOverlay"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebarHeader">
          <div className="logo">
            <div className="logoIcon">🧠</div>
            <div>
              <div className="logoText">AutoResearch</div>
              <div className="logoSub">Command Center</div>
            </div>
          </div>
        </div>

        <div className="sidebarContent">
          <div className="sidebarSection">
            <div className="sidebarSectionTitle">Workflows</div>

            {workflows.map(wf => (
              <div
                key={wf.id}
                className={`workflowItem ${activeWorkflow === wf.id ? 'active' : ''}`}
                onClick={() => onSelectWorkflow(wf.id)}
              >
                <span className={`workflowDot ${wf.status}`} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {wf.name}
                </span>
                {wf.experiments > 0 && (
                  <span style={{
                    fontSize: '10px', fontFamily: 'var(--font-mono)',
                    color: 'var(--fg-subtle)', background: 'var(--bg-subtle)',
                    padding: '1px 6px', borderRadius: '999px',
                  }}>
                    {wf.experiments}
                  </span>
                )}
              </div>
            ))}

            <button className="newWorkflowBtn" onClick={onNewWorkflow}>
              <span style={{ fontSize: '16px' }}>+</span>
              Neuer Workflow
            </button>
          </div>

          <div className="sidebarSection">
            <div className="sidebarSectionTitle">Quick Actions</div>
            <div className="workflowItem" style={{ cursor: 'default', opacity: 0.6 }}>
              <span>📦</span> Data Prep
            </div>
            <div className="workflowItem" style={{ cursor: 'default', opacity: 0.6 }}>
              <span>⚙️</span> Settings
            </div>
            <div className="workflowItem" style={{ cursor: 'default', opacity: 0.6 }}>
              <span>📊</span> All Reports
            </div>
          </div>
        </div>

        <div className="sidebarFooter">
          <div className="systemStatus">
            <span className="statusDot" />
            <span>System bereit — Apple M4</span>
          </div>
        </div>
      </aside>
    </>
  );
}
