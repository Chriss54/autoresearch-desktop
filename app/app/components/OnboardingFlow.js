"use client";

import { useState } from "react";

export default function OnboardingFlow({ onCreateWorkflow, onSkip, onStartDemo }) {
  const [step, setStep] = useState(0);

  const steps = [
    // Step 0: Welcome
    {
      title: "Willkommen bei AutoResearch 🧠",
      body: "Deine Kommandozentrale für autonome KI-Forschung. Ein AI-Agent modifiziert Code, testet Änderungen, und behält was funktioniert — während du schläfst.",
      icon: "🧠",
    },
    // Step 1: How it works
    {
      title: "So funktioniert's",
      body: null,
      icon: null,
    },
    // Step 2: Try it out
    {
      title: "Probier's aus! 🧪",
      body: "Starte eine interaktive Demo mit echten Experiment-Daten. Du siehst, wie alles funktioniert — ohne dass etwas kaputt gehen kann.",
      icon: "🧪",
    },
  ];

  const current = steps[step];
  const isLastStep = step === steps.length - 1;

  return (
    <div className="onboarding">
      {/* Step indicator dots */}
      <div className="onboardingStepIndicator" role="tablist" aria-label="Onboarding-Schritte">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`onboardingDot ${i === step ? 'active' : i < step ? 'completed' : ''}`}
            role="tab"
            aria-selected={i === step}
            aria-label={`Schritt ${i + 1} von ${steps.length}`}
            tabIndex={0}
          />
        ))}
      </div>

      {step === 0 && (
        <>
          <div className="onboardingBrain">🧠</div>
          <h2 className="onboardingTitle">{current.title}</h2>
          <p className="onboardingBody">{current.body}</p>
        </>
      )}

      {step === 1 && (
        <>
          <h2 className="onboardingTitle">{current.title}</h2>
          <div className="onboardingSteps">
            <div className="onboardingStep">
              <span className="onboardingStepIcon">📝</span>
              <span className="onboardingStepLabel">Forschungsauftrag erstellen</span>
            </div>
            <span className="onboardingArrow">→</span>
            <div className="onboardingStep">
              <span className="onboardingStepIcon">▶️</span>
              <span className="onboardingStepLabel">Start drücken</span>
            </div>
            <span className="onboardingArrow">→</span>
            <div className="onboardingStep">
              <span className="onboardingStepIcon">🧠</span>
              <span className="onboardingStepLabel">AI experimentiert autonom</span>
            </div>
            <span className="onboardingArrow">→</span>
            <div className="onboardingStep">
              <span className="onboardingStepIcon">☀️</span>
              <span className="onboardingStepLabel">Ergebnisse am Morgen</span>
            </div>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="onboardingBrain">🧪</div>
          <h2 className="onboardingTitle">{current.title}</h2>
          <p className="onboardingBody">{current.body}</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button
              className="btn btnPrimary"
              onClick={onStartDemo}
              tabIndex={0}
              style={{ padding: '10px 28px', fontSize: '14px' }}
            >
              🧪 Demo starten
            </button>
            <button
              className="btn btnOutline"
              onClick={onCreateWorkflow}
              tabIndex={0}
              style={{ padding: '10px 28px', fontSize: '14px' }}
            >
              ✏️ Eigenen Workflow erstellen
            </button>
          </div>
        </>
      )}

      {!isLastStep && (
        <button
          className="btn btnPrimary"
          onClick={() => setStep(step + 1)}
          tabIndex={0}
          style={{ padding: '10px 28px', fontSize: '14px' }}
        >
          Weiter →
        </button>
      )}

      <button className="onboardingSkip" onClick={onSkip} tabIndex={0} aria-label="Überspringen">
        Überspringen
      </button>
    </div>
  );
}
