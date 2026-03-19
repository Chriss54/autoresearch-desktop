"use client";

export default function HeroSummary({ 
  totalExperiments, keptExperiments, improvement, bestBpb, 
  status, workflowName, currentExperimentNumber 
}) {
  // 3 states: idle-no-data, running, idle-with-data

  if (totalExperiments === 0) {
    return (
      <div className="heroSummary heroEmpty">
        <div className="heroMain">🧠 Bereit zum Forschen.</div>
        <div className="heroSecondary">
          Erstelle einen Workflow und drücke Start — dein AI-Agent experimentiert autonom.
        </div>
      </div>
    );
  }

  if (status === 'running') {
    return (
      <div className="heroSummary heroRunning">
        <div className="heroMain">
          🧠 Dein AI-Researcher arbeitet an „{workflowName}"
        </div>
        <div className="heroSecondary">
          Experiment #{currentExperimentNumber} wird getestet. {keptExperiments} Verbesserung{keptExperiments !== 1 ? 'en' : ''} bisher.
        </div>
        <div className="heroSleep">
          Du kannst diesen Tab schließen — wir benachrichtigen dich bei Rekorden.
        </div>
      </div>
    );
  }

  // idle with data
  const improvPct = improvement > 0 ? (improvement / (bestBpb + improvement) * 100).toFixed(1) : 0;
  return (
    <div className="heroSummary">
      <div className="heroMain">
        🧠 Dein AI-Researcher hat {totalExperiments} Code-Änderungen getestet.
      </div>
      <div className="heroSecondary">
        {keptExperiments} davon haben das Modell verbessert.
        {improvement > 0 && ` Beste Verbesserung: ${improvPct}%.`}
      </div>
      <div className="heroStatus">
        {status === 'completed' ? '✅ Abgeschlossen' : '○ Bereit'} — Drücke Start für eine neue Forschungssession.
      </div>
    </div>
  );
}
