# Creative Prompts — Round 1
> Generated from: `creative_review.md` (2026-03-19)
> Creative Directors: Karpathy × Da Vinci × Jobs
> Standalone Prompts for the Student Agent

---

## How to Use

Each prompt below is **self-contained** — the Student can execute it without additional context beyond the project files. Select which improvements to implement, then hand the corresponding prompts to the Student.

---

## Prompt A-1: Human-Readable Metrics — Kill the Jargon

```
# Task: Replace val_bpb Jargon with Human-Readable Labels

## Context
The AutoResearch Command Center shows "val_bpb" as its primary metric throughout the UI. This is ML jargon (Validation Bits Per Byte) that the target user (Chris, non-ML expert) does not understand. It appears in:
1. StatsGrid stat card: "BEST VAL_BPB"
2. ProgressChart header: "📈 val_bpb Progress"
3. ExperimentTable column header: "VAL_BPB"
4. Run Report labels: "Baseline val_bpb", "Best val_bpb"
5. Toast/notification messages

## Requirements
1. **StatsGrid** (`app/components/StatsGrid.js`):
   - Change stat card label from "Best val_bpb" → "Model Quality"
   - Add a subtitle/secondary line in smaller text: "(val_bpb — lower = better)"
   - Do the same for "Improvement" → "Improvement" stays but add "vs. first experiment" as context

2. **ProgressChart header** (`app/page.js` line ~466):
   - Change "📈 val_bpb Progress" → "📈 Model Quality Over Time"
   - Keep the "Lower is better" text, but make it slightly more prominent

3. **ExperimentTable** (`app/components/ExperimentTable.js`):
   - Keep the column header "VAL_BPB" but add a CSS tooltip on hover:
     "Validation Bits Per Byte — measures how well the model predicts text. Lower = smarter model."

4. **Run Report** (bottom of `app/page.js`):
   - "Baseline val_bpb" → "Starting Quality (val_bpb)"
   - "Best val_bpb" → "Best Quality (val_bpb)"

5. **Toast messages** in celebrateRecord:
   - "🏆 Neuer Rekord! val_bpb: 1.789" → "🏆 New Record! Model quality improved to 1.789"

## Design
- The actual numeric values stay the same (monospace, exact decimals)
- Human labels use var(--font-sans), technical subtitle uses var(--font-mono) at smaller size
- Tooltip style: use existing CSS .tooltipContent class

## Files to Modify
- `app/app/components/StatsGrid.js`
- `app/app/components/ExperimentTable.js`
- `app/app/page.js` (chart header + report labels + toast text)
- `app/app/globals.css` (tooltip styles if needed)

## Acceptance Criteria
- [ ] val_bpb never appears as a standalone label without human context
- [ ] StatsGrid uses "Model Quality" as primary label
- [ ] Chart header says "Model Quality Over Time"
- [ ] Table column has hover tooltip explaining the metric
- [ ] Run Report uses "Starting Quality" / "Best Quality" labels
- [ ] Production build passes
```

---

## Prompt A-2: Hero Summary — Morning Briefing

```
# Task: Add a Hero Summary Section to the Dashboard

## Context
When Chris opens the AutoResearch Command Center, he sees 4 stat cards with raw numbers. He should instead see a HUMAN SENTENCE that tells him what happened. This is the #1 improvement from the Creative Director review.

## Requirements

### 1. Create a HeroSummary component (`app/components/HeroSummary.js`)

The component receives these props:
- totalExperiments (number)
- keptExperiments (number — experiments with status "keep")
- improvement (number — percentage improvement over baseline)
- bestBpb (number)
- status ("idle" | "running" | "completed")
- workflowName (string)
- currentExperiment (number — current running experiment, if applicable)

### 2. Display Logic (3 states)

**State: Idle (with data)**
```
🧠 Your AI researcher tested {totalExperiments} code changes.
{keptExperiments} made the model better. Best improvement: {improvement}%.
● Idle — Press Start to begin a new research session.
```

**State: Running**
```
🧠 Your AI researcher is working on "{workflowName}"
Experiment #{currentExperiment} is running. {keptExperiments} improvements so far.
You can close this tab — we'll notify you of records.
```

**State: Idle (no data)**
```
🧠 Ready to research.
Create a workflow and press Start — your AI will experiment autonomously.
```

### 3. Styling
- Full-width card at the top, ABOVE the stat cards
- Large font for the main sentence (18-20px, var(--font-sans), weight 600)
- Secondary text in var(--fg-muted), 14px
- Status line in 13px with color-coded dot (green=running, gray=idle, blue=complete)
- Subtle gradient border on the left (purple → blue, like the logo)
- Background: var(--bg-default) with slight glow on running state

### 4. Integration
- Add to `app/page.js` — render ABOVE `<StatsGrid>` inside the contentArea
- Calculate keptExperiments from experiments array: `experiments.filter(e => e.status === 'keep').length`
- The stat cards remain visible (they become the "detail row")

### 5. CSS in globals.css
```css
.heroSummary {
  /* Full-width card, padding 24px 28px */
  /* Left border: 4px solid gradient purple→blue */
  /* Animation: slideIn on mount */
}
.heroSummary .heroMain {
  /* 18px, weight 600, var(--fg-default) */
}
.heroSummary .heroSecondary {
  /* 14px, var(--fg-muted) */
}
.heroSummary .heroStatus {
  /* 13px, monospace, with colored dot */
}
```

## Files to Create
- `app/app/components/HeroSummary.js`

## Files to Modify
- `app/app/page.js` (add HeroSummary above StatsGrid)
- `app/app/globals.css` (add heroSummary styles)

## Acceptance Criteria
- [ ] Hero summary visible at the top of the dashboard
- [ ] Shows different messages for idle/running/no-data states
- [ ] Uses human-readable language, not raw numbers alone
- [ ] Non-ML user understands the summary in 3 seconds
- [ ] Production build passes
```

---

## Prompt A-3: Friendlier Status Badges

```
# Task: Make Experiment Status Badges Human-Friendly

## Context
The experiment table shows status badges: "✓ keep", "✗ discard", "☠ crash". These are ML-internal terms. The target user (Chris) doesn't know what "discard" means in this context.

## Requirements

### 1. Change Status Labels (`app/components/ExperimentTable.js`)
- `✓ keep` → `✅ Kept` (green)
- `✗ discard` → `↩️ Skipped` (orange)
- `☠ crash` → `⚠️ Failed` (red)
- `● running` → `⏳ Running` (blue)

### 2. Add Tooltips on Hover
Each badge should have a CSS tooltip explaining what happened:
- **Kept**: "The AI kept this change because it improved the model"
- **Skipped**: "The AI tried this change but it didn't improve the model, so it was skipped"
- **Failed**: "This code change caused an error during training"
- **Running**: "This experiment is currently being evaluated"

### 3. Technical Details
Use the existing `.tooltip` and `.tooltipContent` CSS classes from globals.css.
Wrap each `<span className="statusBadge">` in a `<span className="tooltip">` container.

## Files to Modify
- `app/app/components/ExperimentTable.js`

## Acceptance Criteria
- [ ] Status text changed to Kept/Skipped/Failed/Running
- [ ] Each badge has a tooltip explaining its meaning
- [ ] Colors remain green/orange/red/blue
- [ ] Production build passes
```

---

## Prompt A-4: Hide Commit Hashes by Default

```
# Task: Remove Commit Hash Column from Default Table View

## Context
The experiment table shows a "COMMIT" column with Git hashes like "l2m3n4o". These are meaningless to the target user Chris. Move this data to a tooltip on the experiment number.

## Requirements

### 1. Remove the Commit column (`app/components/ExperimentTable.js`)
- Remove the `<th>Commit</th>` header
- Remove the `<td>{exp.commitHash}</td>` cell
- Add the commit hash as a tooltip on the experiment number:
  - Hover over "#12" → tooltip shows "Commit: l2m3n4o"

### 2. Update CSV Export (`app/page.js`)
- The CSV export should STILL include commit hashes (it's useful for power users who download)
- No change needed to the export logic

## Files to Modify
- `app/app/components/ExperimentTable.js`

## Acceptance Criteria
- [ ] Commit column removed from visible table
- [ ] Commit hash accessible via tooltip on experiment number
- [ ] CSV export still includes commit hashes
- [ ] Table is visually cleaner (5 columns instead of 6)
- [ ] Production build passes
```

---

## Prompt A-5: Language Consistency

```
# Task: Consistent Language Throughout the UI

## Context
The app mixes German and English inconsistently. Decision: Use **German for UI labels** with English technical terms that are universally understood (Workflow, Status, Start, Stop, Export).

## Requirements

### Change these English elements to German:
1. **ExperimentTable headers** (`app/components/ExperimentTable.js`):
   - "Memory" → "Speicher"
   - "Status" stays (universal)
   - "#" stays

2. **StatsGrid** (`app/components/StatsGrid.js`):
   - "Experiments" → "Experimente"
   - "Keep Rate" → "Erfolgsrate" (success rate — more intuitive than "keep rate")
   - "Improvement" → "Verbesserung"
   - "Ready" / "Live" / "Done" → "Bereit" / "Live" / "Fertig"
   - "No data" → "Keine Daten"

3. **TopBar** (`app/components/TopBar.js`):
   - "Running" → "Läuft"
   - "Completed" → "Abgeschlossen"
   - "Idle" → "Bereit"

4. **ProgressChart** (`app/components/ProgressChart.js`):
   - "Lower is better" → "Niedriger = besser" (or keep English, both work)
   - "New Record!" → "Neuer Rekord!" (already German in some places)
   - Tooltip: "Experiment #" stays, "val_bpb:" stays, "best:" → "Bestwert:"

5. **Run Report** (`app/page.js`):
   - "Run Report" → "Bericht"
   - "Total Experiments" → "Gesamt Experimente"
   - "Baseline val_bpb" → "Startwert"
   - "Best val_bpb" → "Bestwert"
   - "Keep Rate" → "Erfolgsrate"
   - "Target" → "Ziel"
   - "Strategy" → "Strategie"

6. **EmptyState** (`app/components/EmptyState.js`):
   - Already mostly German ✅

### Keep these in English (universal terms):
- Workflow, Start, Stop, Export, Live Terminal, Code Diff

## Files to Modify
- `app/app/components/ExperimentTable.js`
- `app/app/components/StatsGrid.js`
- `app/app/components/TopBar.js`
- `app/app/components/ProgressChart.js`
- `app/app/page.js`

## Acceptance Criteria
- [ ] No more inconsistent language mixing
- [ ] All UI labels follow the German-primary strategy
- [ ] Technical terms (Workflow, Start, Export) stay English
- [ ] Production build passes
```

---

## Prompt B-1: Autonomy Dashboard — "Sleep Mode" View

```
# Task: Create an Autonomy Dashboard for Running Workflows

## Context
When a workflow is running, the current dashboard still shows the same data-heavy view. The Creative Director says: "The UI should ENCOURAGE you to walk away." Create a calm, reassuring running mode.

## Requirements

### 1. Create AutonomyView component (`app/components/AutonomyView.js`)

Display this INSTEAD of the normal stats/chart/table when workflow.status === "running":

**Layout:**
- Full-width centered content
- Subtle, slow breathing animation (CSS pulse, 4s cycle, very subtle opacity change 0.8→1)
- Large central status area

**Content:**
```
🧠 [Breathing animation on brain emoji]

Dein AI-Researcher arbeitet an "{workflowName}"
Experiment #{currentExperimentCount + 1} wird getestet

[Progress bar — experiments completed / approximate total based on time budget]

{keptCount} Verbesserungen bisher gefunden
├── Bester Wert: {bestBpb} (↓{improvement}% besser)
└── Laufzeit: {elapsed} / {timeBudget}h

💤 Du kannst diesen Tab schließen.
Wir benachrichtigen dich bei neuen Rekorden.
```

**Dynamic Browser Tab Title:**
- When running: `(🟢 Exp #{n}) AutoResearch`
- When record found: `(🏆 #{n}) AutoResearch` for 30 seconds, then back to normal
- When idle: `AutoResearch Command Center`

### 2. Integration in page.js
- When `currentWorkflow?.status === 'running'`, render `<AutonomyView>` INSTEAD of the normal content (StatsGrid + Chart + Table)
- Add a small "📊 Details anzeigen" link that toggles back to the full data view
- Data view toggle is a local state, defaults to autonomy view when running

### 3. Welcome Back Summary
When user returns after more than 5 minutes of tab inactivity (use Page Visibility API):
- Show a brief overlay:
  "Willkommen zurück! Während du weg warst: {newExperimentsSinceLeave} Experimente, {newRecordsSinceLeave} neue Rekorde."
- Dismiss on click or after 5 seconds
- Track "last seen experiment count" via useRef

### 4. CSS
```css
.autonomyView { /* Full centered layout with breathing animation */ }
.autonomyBrain { /* Large brain emoji with slow pulse */ }
.autonomyMessage { /* 20px, centered, relaxed typography */ }
.autonomyStats { /* Monospace tree-like stats display */ }
.autonomySleep { /* Muted text encouraging user to leave */ }
.autonomyToggle { /* Small link to switch to detail view */ }
```

## Files to Create
- `app/app/components/AutonomyView.js`

## Files to Modify
- `app/app/page.js` (conditional render, tab title, visibility API)
- `app/app/globals.css` (autonomy view styles)

## Acceptance Criteria
- [ ] Running state shows calm autonomy view by default
- [ ] User can toggle to detailed data view
- [ ] Browser tab title updates with status
- [ ] "Welcome back" overlay after tab inactivity
- [ ] Design feels calming and confidence-inducing
- [ ] Production build passes
```

---

## Prompt B-2: First-Run Onboarding

```
# Task: Add Guided Onboarding for First-Time Users

## Context
When a user opens AutoResearch for the first time (no workflows), they see an empty state with a single button. Replace this with a warm, guided 3-step onboarding.

## Requirements

### 1. Create OnboardingFlow component (`app/components/OnboardingFlow.js`)

**Step 1: Welcome**
Title: "Willkommen bei AutoResearch 🧠"
Body: "Deine Kommandozentrale für autonome KI-Forschung. Ein AI-Agent modifiziert Code, testet Änderungen und behält was funktioniert — während du schläfst."
Visual: Brain emoji with subtle glow animation
Action: "Weiter →" button

**Step 2: How It Works**
Title: "So funktioniert's"
Body: 4 steps in a horizontal flow:
1. "📝 Forschungsauftrag erstellen" (Create mission)
2. "▶ Start drücken" (Press Start)
3. "🧠 AI experimentiert autonom" (AI experiments)
4. "☀️ Ergebnisse am Morgen" (Results in the morning)
Visual: Simple step indicator with arrows between steps
Action: "Los geht's →" button

**Step 3: Create First Workflow
Title: "Dein erster Forschungsauftrag"
Body: "Gib deinem ersten Auftrag einen Namen und wähle eine Strategie."
Action: Opens the WorkflowModal directly

### 2. Show Onboarding When:
- No workflows exist (workflows.length === 0)
- LocalStorage key `autoresearch_onboarding_completed` is not set

### 3. After Completion:
- Set LocalStorage `autoresearch_onboarding_completed = true`
- Transition to normal dashboard view

### 4. Skip Option:
- Small "Überspringen" link at bottom of each step
- Also sets localStorage and transitions

### 5. Styling
- Centered, full-width, generous padding
- Step indicators (1, 2, 3 circles) at top
- Smooth transition between steps (slide left animation)
- Colors: purple/blue gradient accents matching the logo

## Files to Create
- `app/app/components/OnboardingFlow.js`

## Files to Modify
- `app/app/page.js` (render OnboardingFlow instead of EmptyState when conditions met)
- `app/app/globals.css` (onboarding styles)

## Acceptance Criteria
- [ ] First-time users see 3-step onboarding
- [ ] Each step has warm, non-technical language
- [ ] Step 3 triggers workflow creation
- [ ] Onboarding can be skipped
- [ ] Doesn't repeat after completion
- [ ] Production build passes
```

---

## Prompt B-3: Expandable Table Rows

```
# Task: Add Expandable Rows to the Experiment Table

## Context
The experiment table shows flat rows with technical data. Users want to understand WHAT the AI changed and WHY it was kept/skipped. Add expandable rows with details.

## Requirements

### 1. Modify ExperimentTable (`app/components/ExperimentTable.js`)

**Collapsed row (default):**
- # (with commit hash tooltip)
- Change description (full text, not truncated)
- Model Quality value
- Status badge

**Expand on click — show detail panel below the row:**
- **Change Details:** Full description of what the AI modified
- **Code Diff:** Show the diff for this specific experiment (if available in diffs data)
- **Technical Details:** Memory usage, commit hash, runtime duration
- **AI Reasoning:** (placeholder for future — "Why this was kept/skipped")

### 2. Props Update
- Add `diffs` as a prop to ExperimentTable
- Pass diffs from page.js

### 3. UI Details
- Click anywhere on a row to expand/collapse
- Expanded row has a smooth height transition (max-height animation)
- Visual indicator: small chevron (▸/▾) on the left of each row
- Expanded area has slightly darker background (var(--bg-subtle))
- Only one row expanded at a time (clicking another collapses the current)

### 4. CSS additions
```css
.experimentRow { cursor: pointer; }
.experimentRow .chevron { transition: transform 150ms; }
.experimentRow.expanded .chevron { transform: rotate(90deg); }
.experimentDetail {
  max-height: 0; overflow: hidden; transition: max-height 300ms;
  background: var(--bg-subtle); padding: 0 12px;
}
.experimentDetail.open { max-height: 400px; padding: 12px; }
```

## Files to Modify
- `app/app/components/ExperimentTable.js`
- `app/app/page.js` (pass diffs prop to ExperimentTable)
- `app/app/globals.css` (expandable row styles)

## Acceptance Criteria
- [ ] Rows expand on click
- [ ] Expanded view shows diff, memory, commit hash
- [ ] Smooth expand/collapse animation
- [ ] Only one row expanded at a time
- [ ] Production build passes
```

---

## Selection Guide

| Priority | Prompts | Estimated Time | Impact on Scores |
|----------|---------|----------------|-----------------|
| **Must-haves** (to reach Enterprise ≥8) | A-1, A-2 | ~2h | Clarity 6→8, Excitement 5→7 |
| **Should-haves** | A-3, A-4, A-5 | ~1h | Clarity 8→8.5, Aesthetics 8→8.5 |
| **High-value features** | B-1, B-2, B-3 | ~8h | Excitement 7→9, Efficiency 7→8 |
| **Nice-to-have** | B-4, C-1 | ~6h | Excitement 9→10 |

**Recommended minimum:** A-1 + A-2 + A-5 (3 prompts, ~3h) — gets all dimensions to ≥8.
