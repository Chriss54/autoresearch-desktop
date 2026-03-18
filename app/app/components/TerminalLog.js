"use client";

import { useRef, useEffect } from "react";

export default function TerminalLog({ logs }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="terminal" ref={containerRef} style={{ minHeight: '200px' }}>
      {logs.map((log, i) => (
        <div key={i} className={`terminalLine ${log.type || ''}`}>
          {log.text}
        </div>
      ))}
      <div className="terminalLine" style={{ opacity: 0.3 }}>
        <span style={{ animation: 'pulse 1s infinite' }}>▌</span>
      </div>
    </div>
  );
}
