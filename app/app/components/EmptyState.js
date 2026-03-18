"use client";

export default function EmptyState({ onCreateWorkflow }) {
  return (
    <div className="emptyState">
      <div className="emptyIcon">🧠</div>
      <h2 className="emptyTitle">Willkommen im AutoResearch Command Center</h2>
      <p className="emptyDesc">
        Erstelle deinen ersten Workflow und lass einen AI-Agent autonom
        LLM-Training optimieren — auf deinem Mac M4 oder in der Cloud.
      </p>
      <button
        className="btn btnPrimary"
        onClick={onCreateWorkflow}
        style={{ padding: '10px 24px', fontSize: '14px' }}
        id="btn-first-workflow"
      >
        + Ersten Workflow erstellen
      </button>
    </div>
  );
}
