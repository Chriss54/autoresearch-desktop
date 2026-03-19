"use client";

import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceDot
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div style={{
      background: '#161b22',
      border: '1px solid #30363d',
      borderRadius: '8px',
      padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      fontSize: '12px',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <div style={{ color: '#f0f6fc', fontWeight: 600, marginBottom: '4px' }}>
        Experiment #{data.experiment}
      </div>
      <div style={{ color: '#3fb950' }}>
        Qualität: {data.valBpb.toFixed(6)}
      </div>
      <div style={{ color: '#58a6ff' }}>
        Bestwert: {data.best.toFixed(6)}
      </div>
      {data.isRecord && (
        <div style={{ color: '#bc8cff', marginTop: '4px', fontWeight: 700 }}>
          🏆 Neuer Rekord!
        </div>
      )}
    </div>
  );
};

export default function ProgressChart({ data }) {
  const records = useMemo(() => data.filter(d => d.isRecord), [data]);

  if (!data || data.length === 0) {
    return (
      <div className="chartContainer" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--fg-subtle)', fontSize: '13px',
      }}>
        Keine Daten — starte einen Workflow um Ergebnisse zu sehen
      </div>
    );
  }

  const yMin = Math.floor(Math.min(...data.map(d => d.best)) * 100) / 100 - 0.01;
  const yMax = Math.ceil(Math.max(...data.map(d => d.valBpb)) * 100) / 100 + 0.01;

  return (
    <div className="chartContainer">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradientBpb" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#58a6ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#58a6ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradientBest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3fb950" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3fb950" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(48, 54, 61, 0.5)"
            vertical={false}
          />
          <XAxis
            dataKey="experiment"
            tick={{ fontSize: 11, fill: '#6e7681', fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={{ stroke: '#30363d' }}
            tickLine={false}
            label={{
              value: "Experiment #",
              position: "insideBottom",
              offset: -2,
              style: { fontSize: 10, fill: '#6e7681' }
            }}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 11, fill: '#6e7681', fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={{ stroke: '#30363d' }}
            tickLine={false}
            width={60}
            tickFormatter={(v) => v.toFixed(3)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="valBpb"
            stroke="#58a6ff"
            strokeWidth={2}
            fill="url(#gradientBpb)"
            dot={false}
            activeDot={{ r: 5, stroke: '#58a6ff', fill: '#161b22', strokeWidth: 2 }}
            name="val_bpb"
          />
          <Area
            type="stepAfter"
            dataKey="best"
            stroke="#3fb950"
            strokeWidth={2}
            strokeDasharray="4 2"
            fill="url(#gradientBest)"
            dot={false}
            name="Best"
          />
          {records.map((r, i) => (
            <ReferenceDot
              key={i}
              x={r.experiment}
              y={r.valBpb}
              r={5}
              fill="#bc8cff"
              stroke="#161b22"
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
