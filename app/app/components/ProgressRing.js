"use client";

export default function ProgressRing({ progress, size = 120, strokeWidth = 8, children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}
        role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Fortschritt">
        {/* Background circle */}
        <circle cx={size/2} cy={size/2} r={radius}
          fill="none" stroke="var(--border-default)" strokeWidth={strokeWidth} />
        {/* Progress arc */}
        <circle cx={size/2} cy={size/2} r={radius}
          fill="none" stroke="url(#progressGradient)" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-purple)" />
            <stop offset="100%" stopColor="var(--accent-green)" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </div>
    </div>
  );
}
