"use client";

export default function StatsGrid({ totalExperiments, bestBpb, improvement, keepRate, status }) {
  return (
    <div className="statsGrid">
      <div className={`statCard ${status === 'running' ? 'highlight' : ''}`}>
        <div className="statLabel">Experimente</div>
        <div className="statValue blue">{totalExperiments}</div>
        <div className="statDelta neutral">
          {status === 'running' ? '● Live' : status === 'completed' ? '✓ Fertig' : '○ Bereit'}
        </div>
      </div>

      <div className={`statCard ${improvement > 0 ? 'record' : ''}`}>
        <div className="statLabel">Modellqualität</div>
        <div className="statValue green">
          {bestBpb < Infinity ? bestBpb.toFixed(4) : '—'}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--fg-subtle)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
          val_bpb — niedriger = besser
        </div>
        {improvement > 0 && (
          <div className="statDelta positive">
            ↓ {improvement.toFixed(4)} besser
          </div>
        )}
      </div>

      <div className="statCard">
        <div className="statLabel">Verbesserung</div>
        <div className={`statValue ${improvement > 0 ? 'purple' : ''}`}>
          {improvement > 0 ? `Δ ${(improvement / (bestBpb + improvement) * 100).toFixed(1)}%` : '—'}
        </div>
        <div className="statDelta neutral">
          vs. Baseline
        </div>
      </div>

      <div className="statCard">
        <div className="statLabel">Erfolgsrate</div>
        <div className={`statValue ${keepRate > 40 ? 'green' : 'orange'}`}>
          {keepRate}%
        </div>
        <div className="statDelta neutral">
          {totalExperiments > 0 ? `${Math.round(totalExperiments * keepRate / 100)} behalten` : 'Keine Daten'}
        </div>
      </div>
    </div>
  );
}
