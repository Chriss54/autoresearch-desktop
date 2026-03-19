"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * GuidedTour — Spotlight overlay with tooltip steps.
 * Highlights specific UI elements and shows explanatory tooltips.
 * 
 * Props:
 *   steps: [{ target, title, text, position }]
 *   onComplete: callback when tour finishes
 *   onSkip: callback when tour is skipped
 */

const TOUR_STEPS = [
  {
    target: '[data-tour="stats"]',
    title: "📊 Dein Überblick",
    text: "Hier siehst du auf einen Blick: Wie viele Experimente, aktuelle Modellqualität, und Verbesserung gegenüber dem Start.",
    position: "bottom",
  },
  {
    target: '[data-tour="chart"]',
    title: "📈 Fortschritts-Chart",
    text: "Der Verlauf zeigt, wie sich dein Modell über Zeit verbessert. Jeder Punkt ist ein Experiment.",
    position: "bottom",
  },
  {
    target: '[data-tour="table"]',
    title: "🧪 Experiment-Tabelle",
    text: "Klick auf eine Zeile für Details — Code-Änderung, Memory-Nutzung und ob das Experiment behalten oder verworfen wurde.",
    position: "top",
  },
  {
    target: '[data-tour="start"]',
    title: "▶️ Starte einen Run",
    text: "Klick auf Start, um die KI trainieren zu lassen. Du kannst zwischen lokaler (Apple Silicon) und Cloud-Ausführung (NVIDIA GPU) wählen.",
    position: "bottom",
  },
];

export default function GuidedTour({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [visible, setVisible] = useState(true);

  const step = TOUR_STEPS[currentStep];

  const updateTargetRect = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      });
    } else {
      setTargetRect(null);
    }
  }, [step]);

  useEffect(() => {
    updateTargetRect();
    const handleResize = () => updateTargetRect();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [currentStep, updateTargetRect]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setVisible(false);
      onComplete?.();
    }
  };

  const handleSkip = () => {
    setVisible(false);
    onSkip?.();
  };

  if (!visible || !step) return null;

  // Calculate tooltip position
  const getTooltipStyle = () => {
    if (!targetRect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

    const style = {};
    const tooltipW = 340;

    if (step.position === "bottom") {
      style.top = targetRect.top + targetRect.height + 16;
      style.left = Math.max(16, Math.min(targetRect.left + targetRect.width / 2 - tooltipW / 2, window.innerWidth - tooltipW - 16));
    } else if (step.position === "top") {
      style.bottom = window.innerHeight - targetRect.top + 16;
      style.left = Math.max(16, Math.min(targetRect.left + targetRect.width / 2 - tooltipW / 2, window.innerWidth - tooltipW - 16));
    }

    return style;
  };

  return (
    <div className="guidedTourOverlay">
      {/* SVG mask for spotlight effect */}
      <svg className="guidedTourMask" width="100%" height="100%">
        <defs>
          <mask id="tourSpotlight">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#tourSpotlight)"
        />
      </svg>

      {/* Spotlight border glow */}
      {targetRect && (
        <div
          className="guidedTourSpotlight"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="guidedTourTooltip"
        style={getTooltipStyle()}
      >
        <div className="guidedTourTitle">{step.title}</div>
        <div className="guidedTourText">{step.text}</div>
        <div className="guidedTourFooter">
          <div className="guidedTourProgress">
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                className={`guidedTourDot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'done' : ''}`}
              />
            ))}
          </div>
          <div className="guidedTourActions">
            <button className="btn btnOutline btnSm" onClick={handleSkip}>
              Überspringen
            </button>
            <button className="btn btnPrimary btnSm" onClick={handleNext}>
              {currentStep < TOUR_STEPS.length - 1 ? 'Weiter →' : 'Fertig ✓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
