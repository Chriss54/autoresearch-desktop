"use client";

export default function ExperimentTable({ experiments }) {
  if (!experiments || experiments.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--fg-subtle)', fontSize: '13px' }}>
        Noch keine Experimente. Starte einen Workflow!
      </div>
    );
  }

  return (
    <table className="experimentTable">
      <thead>
        <tr>
          <th>#</th>
          <th>Commit</th>
          <th>Änderung</th>
          <th>val_bpb</th>
          <th>Memory</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {[...experiments].reverse().map(exp => (
          <tr key={exp.id} className={exp.isRecord ? 'isRecord' : ''}>
            <td>{exp.id}</td>
            <td>{exp.commit}</td>
            <td style={{
              fontFamily: 'var(--font-sans)',
              color: 'var(--fg-default)',
              maxWidth: '300px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {exp.isRecord && <span style={{ marginRight: '4px' }}>🏆</span>}
              {exp.change}
            </td>
            <td style={{
              color: exp.status === 'keep' ? 'var(--accent-green)' :
                     exp.status === 'crash' ? 'var(--accent-red)' : 'var(--fg-muted)',
              fontWeight: exp.status === 'keep' ? 600 : 400,
            }}>
              {exp.status === 'crash' ? '—' : exp.valBpb.toFixed(6)}
            </td>
            <td>
              {exp.status === 'crash' ? '—' : `${exp.peakMemory.toFixed(1)} GB`}
            </td>
            <td>
              <span className={`statusBadge ${exp.status}`}>
                {exp.status === 'keep' && '✓ keep'}
                {exp.status === 'discard' && '✗ discard'}
                {exp.status === 'crash' && '☠ crash'}
                {exp.status === 'running' && '● running'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
