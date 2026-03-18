"use client";

import { useState } from "react";

export default function WorkflowModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('all');
  const [strategy, setStrategy] = useState('conservative');
  const [target, setTarget] = useState('local');
  const [timeBudget, setTimeBudget] = useState(5);
  const [instructions, setInstructions] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      focus,
      strategy,
      target,
      timeBudget: parseInt(timeBudget),
      instructions: instructions.trim(),
    });
  };

  return (
    <div className="modalOverlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modalHeader">
          <span className="modalTitle">🔧 Neuer Workflow</span>
          <button className="btnIcon" onClick={onClose} aria-label="Close" style={{ fontSize: '18px' }}>✕</button>
        </div>

        <div className="modalBody">
          <div className="formGroup">
            <label className="formLabel">Workflow Name</label>
            <input
              className="formInput"
              placeholder="z.B. Nacht-Run: Architecture Sweep"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              id="input-workflow-name"
            />
          </div>

          <div className="formGroup">
            <label className="formLabel">Forschungsfokus</label>
            <select
              className="formSelect"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              id="select-focus"
            >
              <option value="all">🎯 Alles erlaubt — go wild</option>
              <option value="architecture">🏗️ Nur Architektur-Änderungen</option>
              <option value="hyperparameters">🎚️ Nur Hyperparameter</option>
              <option value="optimizer">⚡ Optimizer-Experimente</option>
              <option value="memory">💾 Memory-Optimierung</option>
            </select>
            <div className="formHint">Bestimmt welche Art von Änderungen der Agent ausprobiert</div>
          </div>

          <div className="formGroup">
            <label className="formLabel">Strategie</label>
            <div className="radioGroup">
              <div
                className={`radioOption ${strategy === 'conservative' ? 'selected' : ''}`}
                onClick={() => setStrategy('conservative')}
              >
                <div className="radioIcon">🎯</div>
                <div className="radioLabel">Konservativ</div>
                <div className="radioDesc">Kleine, sichere Schritte</div>
              </div>
              <div
                className={`radioOption ${strategy === 'balanced' ? 'selected' : ''}`}
                onClick={() => setStrategy('balanced')}
              >
                <div className="radioIcon">⚖️</div>
                <div className="radioLabel">Balanced</div>
                <div className="radioDesc">Mix aus beiden</div>
              </div>
              <div
                className={`radioOption ${strategy === 'aggressive' ? 'selected' : ''}`}
                onClick={() => setStrategy('aggressive')}
              >
                <div className="radioIcon">🚀</div>
                <div className="radioLabel">Aggressiv</div>
                <div className="radioDesc">Radikale Änderungen</div>
              </div>
            </div>
          </div>

          <div className="formGroup">
            <label className="formLabel">Execution Target</label>
            <div className="radioGroup">
              <div
                className={`radioOption ${target === 'local' ? 'selected' : ''}`}
                onClick={() => setTarget('local')}
              >
                <div className="radioIcon">🏠</div>
                <div className="radioLabel">Lokal (Mac)</div>
                <div className="radioDesc">Gratis, Apple M4</div>
              </div>
              <div
                className={`radioOption ${target === 'cloud' ? 'selected' : ''}`}
                onClick={() => setTarget('cloud')}
              >
                <div className="radioIcon">☁️</div>
                <div className="radioLabel">Cloud (Modal)</div>
                <div className="radioDesc">NVIDIA GPU Power</div>
              </div>
            </div>
          </div>

          <div className="formGroup">
            <label className="formLabel">Time Budget pro Experiment</label>
            <select
              className="formSelect"
              value={timeBudget}
              onChange={(e) => setTimeBudget(e.target.value)}
              id="select-time-budget"
            >
              <option value={2}>2 Minuten (Quick Test)</option>
              <option value={5}>5 Minuten (Standard)</option>
              <option value={10}>10 Minuten (Extended)</option>
              <option value={30}>30 Minuten (Deep Research)</option>
            </select>
          </div>

          <div className="formGroup">
            <label className="formLabel">Custom Instructions (Optional)</label>
            <textarea
              className="formTextarea"
              placeholder="z.B. 'Fokussiere auf Modelle unter 10M Parametern' oder 'Probiere RoPE-Varianten aus'"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              id="textarea-instructions"
            />
            <div className="formHint">Freitext-Anweisungen an den Research-Agent</div>
          </div>
        </div>

        <div className="modalFooter">
          <button className="btn btnOutline" onClick={onClose}>Abbrechen</button>
          <button
            className="btn btnPrimary"
            onClick={handleCreate}
            disabled={!name.trim()}
            id="btn-create-workflow"
          >
            ✓ Workflow erstellen
          </button>
        </div>
      </div>
    </div>
  );
}
