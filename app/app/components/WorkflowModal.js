"use client";

import { useState, useEffect, useRef } from "react";

export default function WorkflowModal({ onClose, onCreate, onUpdate, editWorkflow }) {
  const isEdit = !!editWorkflow;
  const [name, setName] = useState(editWorkflow?.name || '');
  const [focus, setFocus] = useState(editWorkflow?.focus || 'all');
  const [strategy, setStrategy] = useState(editWorkflow?.strategy || 'conservative');
  const [target, setTarget] = useState(editWorkflow?.target || 'local');
  const [timeBudget, setTimeBudget] = useState(editWorkflow?.timeBudget || 5);
  const [instructions, setInstructions] = useState(editWorkflow?.instructions || '');
  const modalRef = useRef(null);

  // Focus trap and escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = () => {
    if (!name.trim()) return;

    const data = {
      name: name.trim(),
      focus,
      strategy,
      target,
      timeBudget: parseInt(timeBudget),
      instructions: instructions.trim(),
    };

    if (isEdit && onUpdate) {
      onUpdate({ ...data, id: editWorkflow.id });
    } else {
      onCreate(data);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && name.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="modalOverlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal" ref={modalRef}>
        <div className="modalHeader">
          <span className="modalTitle" id="modal-title">
            {isEdit ? '✏️ Workflow bearbeiten' : '🔧 Neuer Workflow'}
          </span>
          <button className="btnIcon" onClick={onClose} aria-label="Close dialog" style={{ fontSize: '18px' }}>✕</button>
        </div>

        <div className="modalBody">
          <div className="formGroup">
            <label className="formLabel" htmlFor="input-workflow-name">Workflow Name</label>
            <input
              className="formInput"
              placeholder="z.B. Nacht-Run: Architecture Sweep"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              id="input-workflow-name"
            />
          </div>

          <div className="formGroup">
            <label className="formLabel" htmlFor="select-focus">Forschungsfokus</label>
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

          <div className="formGroup" role="radiogroup" aria-label="Strategie">
            <label className="formLabel">Strategie</label>
            <div className="radioGroup">
              {[
                { value: 'conservative', icon: '🎯', label: 'Konservativ', desc: 'Kleine, sichere Schritte' },
                { value: 'balanced', icon: '⚖️', label: 'Balanced', desc: 'Mix aus beiden' },
                { value: 'aggressive', icon: '🚀', label: 'Aggressiv', desc: 'Radikale Änderungen' },
              ].map(opt => (
                <div
                  key={opt.value}
                  className={`radioOption ${strategy === opt.value ? 'selected' : ''}`}
                  onClick={() => setStrategy(opt.value)}
                  role="radio"
                  aria-checked={strategy === opt.value}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setStrategy(opt.value); } }}
                >
                  <div className="radioIcon">{opt.icon}</div>
                  <div className="radioLabel">{opt.label}</div>
                  <div className="radioDesc">{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="formGroup" role="radiogroup" aria-label="Execution Target">
            <label className="formLabel">Execution Target</label>
            <div className="radioGroup">
              {[
                { value: 'local', icon: '🏠', label: 'Lokal (Mac)', desc: 'Gratis, Apple Silicon' },
                { value: 'cloud', icon: '☁️', label: 'Cloud (Modal)', desc: 'NVIDIA T4 GPU · ~$0.59/h' },
              ].map(opt => (
                <div
                  key={opt.value}
                  className={`radioOption ${target === opt.value ? 'selected' : ''}`}
                  onClick={() => setTarget(opt.value)}
                  role="radio"
                  aria-checked={target === opt.value}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTarget(opt.value); } }}
                >
                  <div className="radioIcon">{opt.icon}</div>
                  <div className="radioLabel">{opt.label}</div>
                  <div className="radioDesc">{opt.desc}</div>
                </div>
              ))}
            </div>
            {target === 'cloud' && (
              <div className="formHint" style={{ color: 'var(--accent-blue)', marginTop: '6px' }}>
                ☁️ Training läuft auf NVIDIA T4 GPU via Modal. Kosten: ~$0.59/h. Erste 5 Min ca. $0.05.
              </div>
            )}
          </div>

          <div className="formGroup">
            <label className="formLabel" htmlFor="select-time-budget">Time Budget pro Experiment</label>
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
            <label className="formLabel" htmlFor="textarea-instructions">Custom Instructions (Optional)</label>
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
            onClick={handleSubmit}
            disabled={!name.trim()}
            id="btn-create-workflow"
          >
            {isEdit ? '✓ Speichern' : '✓ Workflow erstellen'}
          </button>
        </div>
      </div>
    </div>
  );
}
