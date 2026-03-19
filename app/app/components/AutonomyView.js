"use client";

import ProgressRing from "./ProgressRing";

export default function AutonomyView({
  totalExperiments, keptExperiments, bestBpb, improvement,
  workflowName, timeBudget, startedAt, onShowDetails
}) {
  // Calculate progress based on elapsed time vs time budget
  const now = Date.now();
  const started = startedAt ? new Date(startedAt).getTime() : now;
  const budgetMs = (timeBudget || 300) * 1000; // timeBudget in seconds
  // Estimate total experiments possible: elapsed time so far / experiments done = avg time per exp
  // Progress = elapsed / budget
  const elapsedMs = now - started;
  const progress = Math.min((elapsedMs / budgetMs) * 100, 99);

  // Format elapsed time
  const elapsedSec = Math.floor(elapsedMs / 1000);
  const elapsedHours = Math.floor(elapsedSec / 3600);
  const elapsedMinutes = Math.floor((elapsedSec % 3600) / 60);
  const budgetHours = Math.floor((timeBudget || 300) / 3600);
  const budgetMinutes = Math.floor(((timeBudget || 300) % 3600) / 60);

  const formatTime = (h, m) => {
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const improvPct = improvement > 0 ? (improvement / (bestBpb + improvement) * 100).toFixed(1) : null;

  return (
    <div className="autonomyView">
      <div className="autonomyBrain">🧠</div>

      <div className="autonomyMessage">
        Dein AI-Researcher arbeitet an „{workflowName}"
      </div>
      <div className="autonomySubMessage">
        Experiment #{totalExperiments + 1} wird getestet
      </div>

      <div className="autonomyProgress">
        <ProgressRing progress={progress} size={140} strokeWidth={10}>
          <span className="progressRingLabel">#{totalExperiments + 1}</span>
          <span className="progressRingSublabel">Experiment</span>
        </ProgressRing>
      </div>

      <div className="autonomyStats">
        <div>{keptExperiments} Verbesserung{keptExperiments !== 1 ? 'en' : ''} bisher gefunden</div>
        {bestBpb < Infinity && (
          <div>Bester Wert: {bestBpb.toFixed(4)}{improvPct ? ` (↓${improvPct}% besser)` : ''}</div>
        )}
        <div>Laufzeit: {formatTime(elapsedHours, elapsedMinutes)} / {formatTime(budgetHours, budgetMinutes)}</div>
      </div>

      <div className="autonomySleep">
        💤 Du kannst diesen Tab schließen.<br />
        Wir benachrichtigen dich bei neuen Rekorden.
      </div>

      <button className="autonomyToggle" onClick={onShowDetails}>
        📊 Details anzeigen
      </button>
    </div>
  );
}
