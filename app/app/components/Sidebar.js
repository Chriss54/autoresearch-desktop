"use client";

export default function Sidebar({ workflows, activeWorkflow, onSelectWorkflow, onNewWorkflow, onDeleteWorkflow, onDuplicateWorkflow, onEditWorkflow, isOpen, onClose }) {
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
            <h2 className="sidebarSectionTitle" role="heading" aria-level="2">Workflows</h2>

            {workflows.map(wf => (
              <div
                key={wf.id}
                className={`workflowItem ${activeWorkflow === wf.id ? 'active' : ''}`}
                onClick={() => onSelectWorkflow(wf.id)}
                tabIndex={0}
                role="button"
                aria-label={`Select workflow: ${wf.name}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectWorkflow(wf.id); } }}
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
                {/* Workflow action buttons — visible on hover */}
                <span className="workflowActions" onClick={(e) => e.stopPropagation()}>
                  {onEditWorkflow && (
                    <button
                      className="workflowActionBtn"
                      onClick={() => onEditWorkflow(wf)}
                      title="Workflow bearbeiten"
                      aria-label={`Edit workflow: ${wf.name}`}
                      tabIndex={0}
                    >
                      ✏️
                    </button>
                  )}
                  {onDuplicateWorkflow && (
                    <button
                      className="workflowActionBtn"
                      onClick={() => onDuplicateWorkflow(wf)}
                      title="Workflow duplizieren"
                      aria-label={`Duplicate workflow: ${wf.name}`}
                      tabIndex={0}
                    >
                      📋
                    </button>
                  )}
                  {onDeleteWorkflow && (
                    <button
                      className="workflowActionBtn danger"
                      onClick={() => {
                        if (window.confirm(`Workflow "${wf.name}" wirklich löschen?`)) {
                          onDeleteWorkflow(wf.id);
                        }
                      }}
                      title="Workflow löschen"
                      aria-label={`Delete workflow: ${wf.name}`}
                      tabIndex={0}
                    >
                      🗑️
                    </button>
                  )}
                </span>
              </div>
            ))}

            <button className="newWorkflowBtn" onClick={onNewWorkflow}>
              <span style={{ fontSize: '16px' }}>+</span>
              Neuer Workflow
            </button>
          </div>

          <div className="sidebarSection">
            <h2 className="sidebarSectionTitle" role="heading" aria-level="2">Quick Actions</h2>
            <button
              className="workflowItem"
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, cursor: 'default', opacity: 0.6 }}
              tabIndex={0}
              aria-label="Data Prep (coming soon)"
              disabled
            >
              <span>📦</span> Data Prep
            </button>
            <button
              className="workflowItem"
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, cursor: 'default', opacity: 0.6 }}
              tabIndex={0}
              aria-label="Settings (coming soon)"
              disabled
            >
              <span>⚙️</span> Settings
            </button>
            <button
              className="workflowItem"
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, cursor: 'default', opacity: 0.6 }}
              tabIndex={0}
              aria-label="All Reports (coming soon)"
              disabled
            >
              <span>📊</span> All Reports
            </button>
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
