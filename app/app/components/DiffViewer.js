"use client";

export default function DiffViewer({ diffs }) {
  if (!diffs || diffs.length === 0) {
    return (
      <div style={{
        padding: '24px', textAlign: 'center',
        color: 'var(--fg-subtle)', fontSize: '13px',
        fontFamily: 'var(--font-mono)',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        Kein Diff verfügbar
      </div>
    );
  }

  return (
    <div style={{ padding: '8px 0', minHeight: '200px', maxHeight: '300px', overflowY: 'auto' }}>
      <div style={{
        padding: '6px 16px',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        color: 'var(--fg-subtle)',
        borderBottom: '1px solid var(--border-default)',
        background: 'var(--bg-subtle)',
      }}>
        train.py — Latest Changes
      </div>
      {diffs.map((line, i) => (
        <div
          key={i}
          className={`diffLine ${line.type}`}
          style={{ lineHeight: '1.7' }}
        >
          <span style={{
            display: 'inline-block', width: '16px', color: 'var(--fg-subtle)',
            textAlign: 'center', marginRight: '8px', userSelect: 'none',
          }}>
            {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
          </span>
          {line.text}
        </div>
      ))}
    </div>
  );
}
