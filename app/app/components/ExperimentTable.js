"use client";

import { useState } from "react";

export default function ExperimentTable({ experiments, diffs }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!experiments || experiments.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--fg-subtle)', fontSize: '13px' }}>
        Noch keine Experimente. Starte einen Workflow!
      </div>
    );
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Find diff for a given experiment
  const getDiffForExperiment = (expId) => {
    if (!diffs || diffs.length === 0) return null;
    // Try to match by index (diffs are ordered same as experiments)
    const idx = experiments.findIndex(e => e.id === expId);
    return idx >= 0 && idx < diffs.length ? diffs[idx] : null;
  };

  // Calculate improvement vs baseline
  const baselineBpb = experiments.length > 0 ? experiments[0].valBpb : 0;

  return (
    <table className="experimentTable">
      <caption className="sr-only">Experiment results for the active workflow</caption>
      <thead>
        <tr>
          <th>#</th>
          <th>Änderung</th>
          <th>
            <span className="tooltip">
              Qualität
              <span className="tooltipContent tooltipWide">
                val_bpb (Validation Bits Per Byte) — Misst wie gut das Modell Text vorhersagt. Niedriger = besseres Modell.
              </span>
            </span>
          </th>
          <th>Speicher</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {[...experiments].reverse().map(exp => {
          const isExpanded = expandedId === exp.id;
          const diff = getDiffForExperiment(exp.id);
          const improvPct = baselineBpb > 0 && exp.valBpb > 0 && exp.status !== 'crash'
            ? ((baselineBpb - exp.valBpb) / baselineBpb * 100).toFixed(1)
            : null;

          return (
            <tr key={exp.id} className={`${exp.isRecord ? 'isRecord' : ''}`}>
              <td colSpan="5" style={{ padding: 0 }}>
                {/* Collapsed row */}
                <div
                  className="experimentRow"
                  onClick={() => toggleExpand(exp.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(exp.id); } }}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isExpanded}
                >
                  <span className="chevron" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none' }}>▸</span>
                  <span className="experimentCell cellId">
                    <span className="tooltip">
                      {exp.id}
                      <span className="tooltipContent">Commit: {exp.commitHash}</span>
                    </span>
                  </span>
                  <span className="experimentCell cellChange" style={{
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--fg-default)',
                  }}>
                    {exp.isRecord && <span style={{ marginRight: '4px' }}>🏆</span>}
                    {exp.change}
                  </span>
                  <span className="experimentCell cellBpb" style={{
                    color: exp.status === 'keep' ? 'var(--accent-green)' :
                           exp.status === 'crash' ? 'var(--accent-red)' : 'var(--fg-muted)',
                    fontWeight: exp.status === 'keep' ? 600 : 400,
                  }}>
                    {exp.status === 'crash' ? '—' : exp.valBpb.toFixed(6)}
                  </span>
                  <span className="experimentCell cellMemory">
                    {exp.status === 'crash' ? '—' : `${exp.peakMemory.toFixed(1)} GB`}
                  </span>
                  <span className="experimentCell cellStatus">
                    <span className={`statusBadge ${exp.status}`}>
                      <span className="tooltip">
                        {exp.status === 'keep' && '✅ Behalten'}
                        {exp.status === 'discard' && '↩️ Übersprungen'}
                        {exp.status === 'crash' && '⚠️ Fehlgeschlagen'}
                        {exp.status === 'running' && '⏳ Läuft'}
                        <span className="tooltipContent tooltipWide">
                          {exp.status === 'keep' && 'Der AI-Agent hat diese Änderung behalten, weil sie das Modell verbessert hat'}
                          {exp.status === 'discard' && 'Diese Änderung hat das Modell nicht verbessert und wurde übersprungen'}
                          {exp.status === 'crash' && 'Diese Code-Änderung hat einen Fehler beim Training verursacht'}
                          {exp.status === 'running' && 'Dieses Experiment wird gerade ausgewertet'}
                        </span>
                      </span>
                    </span>
                  </span>
                </div>

                {/* Expanded detail row */}
                {isExpanded && (
                  <div className="experimentDetail">
                    <div className="detailRow">
                      <span className="detailLabel">📝 Änderung:</span>
                      <span className="detailValue">{exp.change}</span>
                    </div>
                    <div className="detailRow">
                      <span className="detailLabel">🔗 Commit:</span>
                      <span className="detailValue">{exp.commitHash}</span>
                    </div>
                    <div className="detailRow">
                      <span className="detailLabel">💾 Speicher:</span>
                      <span className="detailValue">{exp.status === 'crash' ? '—' : `${exp.peakMemory.toFixed(1)} GB`}</span>
                    </div>
                    <div className="detailRow">
                      <span className="detailLabel">📊 Qualität:</span>
                      <span className="detailValue">
                        {exp.status === 'crash' ? '—' : exp.valBpb.toFixed(6)}
                        {improvPct && ` (${Number(improvPct) >= 0 ? '↓' : '↑'} ${Math.abs(Number(improvPct))}% vs. Baseline)`}
                      </span>
                    </div>
                    {diff && (
                      <div className="diffSection">
                        <div className="detailLabel" style={{ marginBottom: '6px' }}>📝 Code Diff:</div>
                        <div className="terminal" style={{ maxHeight: '150px' }}>
                          {diff.split('\n').map((line, i) => (
                            <div key={i} className={`diffLine ${line.startsWith('+') ? 'added' : line.startsWith('-') ? 'removed' : 'context'}`}>
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
