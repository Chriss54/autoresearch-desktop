# Student Prompt — Creative Director Improvements (All 10)
> Round 1 Implementation | Date: 2026-03-19
> Source: `creative_review.md` + `creative_prompts_round_1.md`
> Quality Preset: Enterprise
> Goal: All 5D-Scores ≥ 8

---

## Kontext

Du bist der **Student (ML Systems Engineer, Stanford AI Lab)**. Das AutoResearch Command Center hat den Examiner bestanden (13/13 Fixes), und der Creative Director (Karpathy × Da Vinci × Jobs) hat 10 Verbesserungen identifiziert, die alle umgesetzt werden sollen.

**Das Hauptproblem:** Die App zeigt *Daten* statt *Narrative*. Chris (tech-interessiert, kein ML-Experte) versteht `val_bpb` nicht, sieht keine Geschichte und wird nicht ermutigt, den Agent autonom arbeiten zu lassen.

**Aktuelle Scores:** Clarity 6, Efficiency 7, Aesthetics 8, Robustness 8, Excitement 5 → Ziel: alle ≥ 8.

**Lies diese Dateien zuerst:**
- `project_brief.md` — Vision + Anforderungen
- `creative_review.md` — Vollständige Review mit Begründungen
- `creative_prompts_round_1.md` — Detaillierte Einzelprompts als Referenz

**Dev Server läuft bereits:** `cd app && npm run dev` auf `http://localhost:3000`

---

## Implementierung — Reihenfolge

Arbeite die Änderungen in dieser Reihenfolge ab. Jeder Schritt baut auf dem vorherigen auf.

---

### Phase 1: Foundation (Sprache & Jargon bereinigen)

#### 1.1 — Language Consistency (A-5)

Die App mischt Deutsch und Englisch inkonsistent. **Strategie: Deutsch als UI-Sprache, mit englischen Universal-Begriffen (Workflow, Start, Stop, Export, Status, Live Terminal, Code Diff).**

**Änderungen:**

| Datei | Aktuell | Neu |
|-------|---------|-----|
| `StatsGrid.js` | "Experiments" | "Experimente" |
| `StatsGrid.js` | "Keep Rate" | "Erfolgsrate" |
| `StatsGrid.js` | "Improvement" | "Verbesserung" |
| `StatsGrid.js` | "Ready" / "Live" / "Done" | "Bereit" / "Live" / "Fertig" |
| `StatsGrid.js` | "No data" | "Keine Daten" |
| `StatsGrid.js` | "kept" | "behalten" |
| `TopBar.js` | "● Running" | "● Läuft" |
| `TopBar.js` | "✓ Completed" | "✓ Abgeschlossen" |
| `TopBar.js` | "○ Idle" | "○ Bereit" |
| `ExperimentTable.js` | "Memory" (th) | "Speicher" |
| `ProgressChart.js` | "New Record!" (tooltip) | "Neuer Rekord!" |
| `ProgressChart.js` | "best:" (tooltip) | "Bestwert:" |
| `page.js` Run Report | "Run Report" | "📊 Bericht" |
| `page.js` Run Report | "Total Experiments" | "Gesamt" |
| `page.js` Run Report | "Baseline val_bpb" | "Startwert" |
| `page.js` Run Report | "Best val_bpb" | "Bestwert" |
| `page.js` Run Report | "Keep Rate" | "Erfolgsrate" |
| `page.js` Run Report | "Target" | "Ziel" |
| `page.js` Run Report | "Strategy" | "Strategie" |

**Bleiben Englisch:** Workflow, Start, Stop, Export, Live Terminal, Code Diff, Status (als Badge-Label).

#### 1.2 — Human-Readable Metrics (A-1)

`val_bpb` darf nirgends als alleinstehender Begriff stehen. Überall menschlichen Kontext hinzufügen:

**StatsGrid.js:**
- Stat-Card Label: "Best val_bpb" → **"Modellqualität"**
- Unter dem Wert (neues `<div>` in kleiner Schrift, 10px, `var(--fg-subtle)`, `var(--font-mono)`): `"val_bpb — niedriger = besser"`

**page.js (Chart Header, ~Zeile 466):**
- `"📈 val_bpb Progress"` → `"📈 Modellqualität über Zeit"`
- `"Lower is better"` → `"Niedriger = besser"` (etwas größer: 12px statt 11px)

**ExperimentTable.js (Spaltenheader):**
- `<th>val_bpb</th>` → Wrap in einem Tooltip-Container:
```jsx
<th>
  <span className="tooltip">
    Qualität
    <span className="tooltipContent">
      val_bpb (Validation Bits Per Byte) — Misst wie gut das Modell Text vorhersagt. Niedriger = besseres Modell.
    </span>
  </span>
</th>
```

**page.js (Run Report Labels):**
- Bereits in 1.1 geändert ("Startwert" / "Bestwert")
- Zusätzlich: `improvement` Zeile → `"Verbesserung"` (schon in 1.1), Wert bleibt `Δ -0.063800`

**page.js (Toast in celebrateRecord):**
- `"🏆 Neuer Rekord! val_bpb: ${newBpb.toFixed(6)}"` → `"🏆 Neuer Rekord! Modellqualität: ${newBpb.toFixed(6)} (besser als zuvor!)"`

**page.js (Browser Notification in celebrateRecord):**
- `body: "val_bpb: ${newBpb.toFixed(6)}"` → `body: "Neuer Bestwert: ${newBpb.toFixed(6)}"`

#### 1.3 — Friendlier Status Badges (A-3)

**ExperimentTable.js — Status-Texte ändern:**

```jsx
{exp.status === 'keep' && '✅ Behalten'}
{exp.status === 'discard' && '↩️ Übersprungen'}
{exp.status === 'crash' && '⚠️ Fehlgeschlagen'}
{exp.status === 'running' && '⏳ Läuft'}
```

**Tooltips hinzufügen** (jeder Badge in einem Tooltip-Container):
- **Behalten:** "Der AI-Agent hat diese Änderung behalten, weil sie das Modell verbessert hat"
- **Übersprungen:** "Diese Änderung hat das Modell nicht verbessert und wurde übersprungen"
- **Fehlgeschlagen:** "Diese Code-Änderung hat einen Fehler beim Training verursacht"
- **Läuft:** "Dieses Experiment wird gerade ausgewertet"

#### 1.4 — Hide Commit Hashes (A-4)

**ExperimentTable.js:**
- `<th>Commit</th>` Spalte **entfernen**
- `<td>{exp.commitHash}</td>` Zelle **entfernen**
- Stattdessen: Die Experiment-Nummer (`<td>{exp.id}</td>`) in einen Tooltip wrappen:
```jsx
<td>
  <span className="tooltip">
    {exp.id}
    <span className="tooltipContent">Commit: {exp.commitHash}</span>
  </span>
</td>
```
- CSV-Export in `page.js` behält Commit-Hashes (keine Änderung dort)

**CSS: Tooltip-Positionierung prüfen** — `.tooltipContent` existiert schon in `globals.css`. Falls nötig, eine Variante `.tooltipContent.right` hinzufügen für Tooltips die rechts-ausgerichtet sein sollen (Experiment-Nummer ist links am Rand).

---

### Phase 2: Narrative & Hero (Dashboard-Transformation)

#### 2.1 — Hero Summary Component (A-2) ⭐ WICHTIGSTE ÄNDERUNG

**Neue Datei: `app/app/components/HeroSummary.js`**

```jsx
"use client";

export default function HeroSummary({ 
  totalExperiments, keptExperiments, improvement, bestBpb, 
  status, workflowName, currentExperimentNumber 
}) {
  // 3 Zustände: idle-with-data, running, idle-no-data
  
  if (totalExperiments === 0) {
    return (
      <div className="heroSummary heroEmpty">
        <div className="heroMain">🧠 Bereit zum Forschen.</div>
        <div className="heroSecondary">
          Erstelle einen Workflow und drücke Start — dein AI-Agent experimentiert autonom.
        </div>
      </div>
    );
  }

  if (status === 'running') {
    return (
      <div className="heroSummary heroRunning">
        <div className="heroMain">
          🧠 Dein AI-Researcher arbeitet an „{workflowName}"
        </div>
        <div className="heroSecondary">
          Experiment #{currentExperimentNumber} wird getestet. {keptExperiments} Verbesserung{keptExperiments !== 1 ? 'en' : ''} bisher.
        </div>
        <div className="heroSleep">
          Du kannst diesen Tab schließen — wir benachrichtigen dich bei Rekorden.
        </div>
      </div>
    );
  }

  // idle with data
  const improvPct = improvement > 0 ? (improvement / (bestBpb + improvement) * 100).toFixed(1) : 0;
  return (
    <div className="heroSummary">
      <div className="heroMain">
        🧠 Dein AI-Researcher hat {totalExperiments} Code-Änderungen getestet.
      </div>
      <div className="heroSecondary">
        {keptExperiments} davon haben das Modell verbessert.
        {improvement > 0 && ` Beste Verbesserung: ${improvPct}%.`}
      </div>
      <div className="heroStatus">
        {status === 'completed' ? '✅ Abgeschlossen' : '○ Bereit'} — Drücke Start für eine neue Forschungssession.
      </div>
    </div>
  );
}
```

**CSS in globals.css hinzufügen:**
```css
/* ---- Hero Summary ---- */
.heroSummary {
  background: var(--bg-default);
  border: 1px solid var(--border-default);
  border-left: 4px solid;
  border-image: linear-gradient(180deg, var(--accent-purple), var(--accent-blue)) 1;
  border-radius: var(--radius-lg);
  padding: 24px 28px;
  animation: slideIn 400ms ease;
}

.heroSummary.heroRunning {
  border-image: linear-gradient(180deg, var(--accent-green), var(--accent-cyan)) 1;
  box-shadow: var(--shadow-glow-green);
}

.heroMain {
  font-size: 18px;
  font-weight: 600;
  color: var(--fg-default);
  line-height: 1.4;
  margin-bottom: 6px;
}

.heroSecondary {
  font-size: 14px;
  color: var(--fg-muted);
  line-height: 1.5;
  margin-bottom: 8px;
}

.heroStatus {
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--fg-subtle);
}

.heroSleep {
  font-size: 13px;
  color: var(--fg-subtle);
  margin-top: 8px;
  font-style: italic;
}
```

**Integration in page.js:**
- Importiere `HeroSummary`
- Rendere **über** `<StatsGrid>`:
```jsx
const keptExperiments = experiments.filter(e => e.status === 'keep').length;

<HeroSummary
  totalExperiments={totalExperiments}
  keptExperiments={keptExperiments}
  improvement={improvement}
  bestBpb={bestBpb}
  status={currentWorkflow.status}
  workflowName={currentWorkflow.name}
  currentExperimentNumber={totalExperiments + 1}
/>
<StatsGrid ... />
```

---

### Phase 3: Running Experience (Autonomy)

#### 3.1 — Autonomy "Sleep Mode" View (B-1)

**Neue Datei: `app/app/components/AutonomyView.js`**

Wenn `workflow.status === "running"`, zeige STATT dem normalen Content (Chart + Table) eine beruhigende, zentrierte Ansicht:

**Layout:**
```
         🧠          ← Großes Brain-Emoji mit langsamer Puls-Animation (4s Zyklus)
    
    Dein AI-Researcher arbeitet an „{name}"
    Experiment #{n} wird getestet
    
    ████████████░░░░░░░░ 60%    ← Fortschrittsbalken (elapsed / timeBudget)
    
    3 Verbesserungen bisher gefunden
    Bester Wert: 1.7891 (↓3.4% besser)
    Laufzeit: 2h 15m / 10h
    
    💤 Du kannst diesen Tab schließen.
    Wir benachrichtigen dich bei neuen Rekorden.
    
    [📊 Details anzeigen]    ← Kleiner Link, togglet zur Data-Ansicht
```

**Props:** totalExperiments, keptExperiments, bestBpb, improvement, workflowName, timeBudget, startedAt (aus workflow oder fallback), onShowDetails (callback)

**Data View Toggle:** Lokaler State `showDetails` in `page.js`. Default: false (Autonomy-View). Toggle-Button schaltet um. Wenn Workflow stoppt, zurück zu Normal-Ansicht.

**Dynamischer Browser-Tab-Titel:**
- `page.js` — `useEffect` der `document.title` setzt:
  - Running: `"(🟢 Exp #${n}) AutoResearch"`
  - Bei neuem Rekord (30 Sekunden): `"(🏆) AutoResearch"` → dann zurück
  - Idle: `"AutoResearch Command Center"`

**"Willkommen zurück" Overlay:**
- Page Visibility API: `document.addEventListener('visibilitychange', ...)`
- Wenn Tab > 5 Minuten unsichtbar war UND es neue Experimente gibt:
  - Zeige ein kleines Overlay/Toast oben:
  ```
  "Willkommen zurück! Während du weg warst: {n} neue Experimente, {m} Verbesserungen."
  ```
  - Schließt sich nach 6 Sekunden oder bei Klick
- Tracking via `useRef`: `lastSeenExperimentCount`, `lastVisibleTimestamp`

**CSS:**
```css
.autonomyView {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  min-height: 60vh;
}

.autonomyBrain {
  font-size: 64px;
  animation: breathe 4s ease-in-out infinite;
  margin-bottom: 24px;
}

@keyframes breathe {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

.autonomyMessage {
  font-size: 20px;
  font-weight: 600;
  color: var(--fg-default);
  margin-bottom: 8px;
}

.autonomySubMessage {
  font-size: 15px;
  color: var(--fg-muted);
  margin-bottom: 24px;
}

.autonomyProgress {
  width: 100%;
  max-width: 400px;
  margin-bottom: 24px;
}

.autonomyStats {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--fg-muted);
  line-height: 1.8;
  margin-bottom: 24px;
}

.autonomySleep {
  font-size: 14px;
  color: var(--fg-subtle);
  font-style: italic;
  margin-bottom: 16px;
}

.autonomyToggle {
  font-size: 13px;
  color: var(--accent-blue);
  cursor: pointer;
  background: none;
  border: none;
  font-family: var(--font-sans);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.autonomyToggle:hover {
  color: var(--accent-blue-hover);
}

.welcomeBack {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-default);
  border: 1px solid var(--accent-purple);
  border-radius: var(--radius-lg);
  padding: 16px 24px;
  z-index: 250;
  animation: slideUp 300ms ease;
  box-shadow: var(--shadow-lg);
  font-size: 14px;
  color: var(--fg-default);
  cursor: pointer;
  max-width: 500px;
  text-align: center;
}
```

---

### Phase 4: Onboarding & Table UX

#### 4.1 — First-Run Onboarding (B-2)

**Neue Datei: `app/app/components/OnboardingFlow.js`**

3-Schritt-Onboarding, gezeigt STATT `<EmptyState>` wenn:
- `workflows.length === 0`
- UND LocalStorage `autoresearch_onboarded` nicht gesetzt ist

**Step 1: "Willkommen bei AutoResearch 🧠"**
- Text: "Deine Kommandozentrale für autonome KI-Forschung. Ein AI-Agent modifiziert Code, testet Änderungen, und behält was funktioniert — während du schläfst."
- Visual: Brain-Emoji 64px mit leuchtendem Hintergrund
- Button: "Weiter →"

**Step 2: "So funktioniert's"**
- 4 Schritte horizontal:
  1. 📝 "Forschungsauftrag erstellen"
  2. ▶️ "Start drücken"
  3. 🧠 "AI experimentiert autonom"
  4. ☀️ "Ergebnisse am Morgen"
- Einfache Step-Anzeige mit Pfeil zwischen Schritten
- Button: "Los geht's →"

**Step 3: Trigger `onCreateWorkflow()` direkt** — öffnet die Workflow-Modal automatisch. Der Onboarding-Flow schließt sich und setzt `localStorage.setItem('autoresearch_onboarded', 'true')`.

**Skip-Option:** Kleiner "Überspringen" Link unter jedem Button. Setzt auch localStorage.

**CSS:**
```css
.onboarding {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 70vh;
}

.onboardingStepIndicator {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.onboardingDot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--border-default);
  transition: all var(--transition-normal);
}

.onboardingDot.active {
  background: var(--accent-purple);
  box-shadow: 0 0 8px rgba(188, 140, 255, 0.4);
}

.onboardingDot.completed {
  background: var(--accent-green);
}

.onboardingTitle {
  font-size: 24px;
  font-weight: 700;
  color: var(--fg-default);
  margin-bottom: 12px;
}

.onboardingBody {
  font-size: 15px;
  color: var(--fg-muted);
  max-width: 500px;
  line-height: 1.6;
  margin-bottom: 32px;
}

.onboardingSteps {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.onboardingStep {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px;
  background: var(--bg-default);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  min-width: 140px;
}

.onboardingStepIcon {
  font-size: 28px;
}

.onboardingStepLabel {
  font-size: 12px;
  font-weight: 600;
  color: var(--fg-muted);
  text-align: center;
}

.onboardingArrow {
  font-size: 20px;
  color: var(--fg-subtle);
}

.onboardingSkip {
  margin-top: 16px;
  font-size: 12px;
  color: var(--fg-subtle);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  font-family: var(--font-sans);
}

.onboardingSkip:hover {
  color: var(--fg-muted);
}
```

**Integration in page.js:**
- Statt `<EmptyState>` → prüfe ob onboarding benötigt wird:
```jsx
const [onboarded, setOnboarded] = useState(true); // default true, check on mount

useEffect(() => {
  if (typeof window !== 'undefined') {
    setOnboarded(localStorage.getItem('autoresearch_onboarded') === 'true');
  }
}, []);

// In render:
{!currentWorkflow && workflows.length === 0 && !onboarded ? (
  <OnboardingFlow onCreateWorkflow={() => { 
    localStorage.setItem('autoresearch_onboarded', 'true');
    setOnboarded(true);
    setShowModal(true); 
  }} onSkip={() => {
    localStorage.setItem('autoresearch_onboarded', 'true');
    setOnboarded(true);
  }} />
) : !currentWorkflow ? (
  <EmptyState onCreateWorkflow={() => setShowModal(true)} />
) : (
  /* Normal dashboard content */
)}
```

#### 4.2 — Expandable Table Rows (B-3)

**ExperimentTable.js — Komplett überarbeiten:**

- Jede Zeile wird klickbar, mit Expand/Collapse
- State: `const [expandedId, setExpandedId] = useState(null)`
- Props erweitern: `experiments, diffs` (diffs von page.js durchreichen)

**Collapsed Row (Standard):**
```
▸ #12  | 🏆 Warmup ratio 0.05 + warmdown 0.6  | 1.789100 | 7.1 GB | ✅ Behalten
```

**Expanded Row (bei Klick):**
```
▾ #12  | 🏆 Warmup ratio 0.05 + warmdown 0.6  | 1.789100 | 7.1 GB | ✅ Behalten
  ┌───────────────────────────────────────────────────────────────┐
  │ 📝 Änderung: Warmup ratio 0.05 + warmdown 0.6               │
  │ 🔗 Commit: l2m3n4o                                           │
  │ 💾 Peak Memory: 7.1 GB                                       │
  │ 📊 Qualität: 1.789100 (↓ 3.4% vs. Baseline)                 │
  │                                                               │
  │ 📝 Code Diff:                                                 │
  │   - lr = 0.001                                                │
  │   + lr = 0.0005                                               │
  │   + warmup_ratio = 0.05                                       │
  └───────────────────────────────────────────────────────────────┘
```

**Klick auf eine andere Reihe** → schließt die aktuelle, öffnet die neue.

**Props in page.js übergeben:**
```jsx
<ExperimentTable experiments={experiments} diffs={diffs} />
```

**CSS:**
```css
.experimentRow {
  cursor: pointer;
  user-select: none;
}

.experimentRow:hover {
  background: var(--bg-subtle);
}

.chevron {
  display: inline-block;
  transition: transform var(--transition-fast);
  font-size: 10px;
  color: var(--fg-subtle);
  margin-right: 6px;
  width: 12px;
}

.chevron.expanded {
  transform: rotate(90deg);
}

.experimentDetail {
  background: var(--bg-subtle);
  border-top: 1px solid var(--border-subtle);
  padding: 16px 20px 16px 48px;
  font-size: 12px;
  color: var(--fg-muted);
  line-height: 1.8;
  animation: fadeIn 200ms ease;
}

.experimentDetail .detailRow {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.experimentDetail .detailLabel {
  color: var(--fg-subtle);
  min-width: 100px;
  font-weight: 500;
}

.experimentDetail .detailValue {
  font-family: var(--font-mono);
  color: var(--fg-default);
}

.experimentDetail .diffSection {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-subtle);
}
```

---

### Phase 5: Polish (Progress Ring + Notifications)

#### 5.1 — Apple-Style Progress Ring (B-4)

**Neue Datei: `app/app/components/ProgressRing.js`**

Ein SVG-basierter Fortschrittsring der in der AutonomyView verwendet wird:

```jsx
export default function ProgressRing({ progress, size = 120, strokeWidth = 8, children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
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
```

**Verwendung in AutonomyView:** Statt eines flachen Fortschrittsbalkens den Ring zeigen:
- Mitte: Experiment # in großer Schrift
- Darunter: "von ~{total}" in kleiner Schrift
- Fortschritt = elapsed time / time budget

**CSS für Ring:**
```css
.progressRingLabel {
  font-family: var(--font-mono);
  font-size: 28px;
  font-weight: 700;
  color: var(--fg-default);
}

.progressRingSublabel {
  font-size: 11px;
  color: var(--fg-subtle);
}
```

#### 5.2 — Morning Report / Smart Notifications (C-1)

**Erweiterung des bestehenden Notification-Systems in page.js:**

1. **Tab-Inaktivitäts-Tracking** (schon in B-1 teilweise implementiert):
   - `useRef` für `lastVisibleTime` und `experimentCountWhenLeft`
   - Bei `visibilitychange` → "hidden": speichere aktuelle Werte
   - Bei `visibilitychange` → "visible": prüfe Differenz

2. **Extended Welcome-Back Summary:**
   Wenn > 60 Minuten vergangen UND neue Experimente existieren:
   ```
   ☀️ Willkommen zurück!
   Dein AI-Researcher hat in den letzten {hours}h {n} Experimente durchgeführt.
   {m} Verbesserungen gefunden. {records} neue Rekorde!
   
   Bester Wert: {bestBpb} (↓{improvement}% besser als zu Beginn)
   ```
   
   Dies als prominenteres Modal (nicht nur Toast), das mit Klick geschlossen wird.

3. **Browser-Tab Favicon Badge (optional, wenn zeit):**
   - Dynamisches Favicon mit Experimenten-Count badge
   - Canvas-basiert: zeichne Zahl auf grünem Kreis

4. **Scheduled Notification (sofern Permission erteilt):**
   - If user granted notification permission & workflow is running:
   - Alle 30 Minuten eine Browser-Notification:
     `"🧠 AutoResearch läuft: {n} Experimente, {m} Verbesserungen bisher."`
   - Only when tab is not visible (don't spam in foreground)

---

## Abschließende Checkliste

Nach allen Änderungen:

- [ ] `npx next build` — 0 Errors
- [ ] Browser öffnen → HeroSummary sichtbar
- [ ] `val_bpb` nirgends als alleinstehender Begriff
- [ ] Alle Status-Badges auf Deutsch (Behalten/Übersprungen/Fehlgeschlagen)
- [ ] Sprache konsistent Deutsch
- [ ] Commit-Hashes versteckt (nur via Tooltip)
- [ ] Running-State → AutonomyView mit Breathing-Animation
- [ ] Tab-Titel ändert sich bei Running
- [ ] Willkommen-zurück-Overlay nach Tab-Inaktivität
- [ ] Onboarding für neue User (3 Schritte)
- [ ] Tabellen-Rows expandierbar mit Details + Diff
- [ ] Progress Ring in AutonomyView
- [ ] Smart Notifications bei langer Abwesenheit
- [ ] Kein visuelles Rauschen, klare Hierarchie
- [ ] Responsive auf Mobile immer noch funktional

## Dateien-Übersicht

### Neue Dateien:
- `app/app/components/HeroSummary.js`
- `app/app/components/AutonomyView.js`
- `app/app/components/OnboardingFlow.js`
- `app/app/components/ProgressRing.js`

### Geänderte Dateien:
- `app/app/page.js` — Hero, Autonomy-Toggle, Tab-Titel, Visibility-API, Onboarding-Logik
- `app/app/globals.css` — Hero, Autonomy, Onboarding, Expandable Rows, Progress Ring Styles
- `app/app/components/StatsGrid.js` — Sprache + "Modellqualität" Label
- `app/app/components/TopBar.js` — Deutsche Badge-Labels
- `app/app/components/ExperimentTable.js` — Tooltips, Expandable Rows, deutsche Labels, Commit-Hash weg
- `app/app/components/ProgressChart.js` — Deutsche Tooltip-Labels

### Nicht geändert:
- `app/app/components/WorkflowModal.js` — Schon gut (Creative Director: ✅)
- `app/app/components/EmptyState.js` — Bleibt als Fallback (nach Onboarding)
- Backend API Routes — Keine Änderungen nötig
- Engine/Python — Keine Änderungen nötig
