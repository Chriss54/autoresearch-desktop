# Revision Log — AutoResearch Command Center
> Revision Round: 1  
> Date: 2026-03-19  
> Persona: Domain-specific developer (ML Infrastructure)  
> Quality Preset: Enterprise  

---

## Summary

All **10 unique errors** (13 total, some duplicates) from the Examiner Report have been addressed.

| Priority | Fixed | Details |
|----------|-------|---------|
| P1 (Critical) | 1/1 | Subprocess lifecycle hardened |
| P2 (High) | 2/2 | Commit hash fixed, workflow edit/delete/duplicate added |
| P3 (Medium) | 5/5 | Cloud 501, confetti+notifications, export CSV, keyboard a11y, duplicate fix |
| P4 (Low) | 2/2 | Semantic HTML, heading hierarchy |

**Build status:** ✅ Production build passes  
**Browser verification:** ✅ All fixes visually confirmed  

---

## Fixes Applied

### FIX P-009/P-029 — Subprocess Lifecycle [P1 Critical]
**Files:** `engine/run_experiment.py`, `app/api/engine/route.js`

**Root cause:** In-memory process tracking lost on hot-module-replacement; no SIGTERM handler; fixed experiment count instead of time budget.

**Changes:**
1. **SIGTERM handler** in `run_experiment.py` restores `train_mlx.py` from backup before clean exit
2. **SIGINT handler** added for Ctrl+C scenarios
3. **PID file tracking** — writes `/tmp/autoresearch_{workflowId}.pid` on start, cleans up on exit
4. **Stale PID cleanup** — `engine/route.js` checks for dead orphaned processes on module load
5. **Time-budget-based loop** — defaults to 10 hours, not fixed 20 experiments. `--max-experiments 0` = unlimited
6. **Graceful shutdown check** between training iterations
7. **Health check endpoint** — `action: "health"` to verify process liveness

---

### FIX P-004 — Commit Hash Column Empty [P2]
**File:** `app/components/ExperimentTable.js`

**Root cause:** Field name mismatch — component used `exp.commit` but DB/API returns `exp.commitHash`.

**Change:** `{exp.commit}` → `{exp.commitHash}` (1-line fix, line 28)

---

### FIX P-007 — Workflow Library Edit/Duplicate/Delete [P2]
**Files:** `app/components/Sidebar.js`, `app/components/WorkflowModal.js`, `app/page.js`, `app/api/workflows/route.js`, `lib/database.js`

**Root cause:** `handleDeleteWorkflow` existed in `page.js` but no UI triggered it. Edit and duplicate functionality was completely missing.

**Changes:**
1. **Sidebar.js** — Added ✏️ Edit, 📋 Duplicate, 🗑️ Delete action buttons per workflow item (hover-show)
2. **WorkflowModal.js** — Added edit mode via `editWorkflow` and `onUpdate` props; pre-fills all fields
3. **page.js** — Added `handleDuplicateWorkflow`, `handleEditWorkflow`, `handleUpdateWorkflow` functions
4. **database.js** — Added `updateWorkflow()` function for full field updates
5. **workflows/route.js** — Enhanced PATCH endpoint to support full updates, not just status
6. **Delete** has confirmation dialog

---

### FIX P-008/P-028 — Cloud Selection Does Nothing [P3]
**Files:** `app/api/engine/route.js`, `app/components/WorkflowModal.js`, `app/page.js`

**Root cause:** Cloud target was saved to DB but engine always spawned local training.

**Changes:**
1. **engine/route.js** — Returns 501 with `CLOUD_NOT_IMPLEMENTED` code when `target === 'cloud'`
2. **WorkflowModal.js** — Cloud option shows "Coming Soon" description with orange warning text
3. **page.js** — Catches 501 and shows user-friendly toast: "Cloud execution (Modal) ist noch nicht implementiert"

---

### FIX P-013/P-022 — Record Notification + Confetti [P3]
**Files:** `app/page.js`, `app/globals.css`, `package.json`

**Root cause:** Only passive glow on stat card — no active notification system.

**Changes:**
1. **canvas-confetti** library installed — fires multi-burst confetti animation on new record
2. **Browser Notification** — `new Notification("🏆 Neuer Rekord!")` with val_bpb value
3. **Toast notification** — visible in-app toast with slide-up animation
4. **Audio chime** — Web Audio API synthesizes a pleasant C-major arpeggio (no external file needed)
5. **Record detection** — tracks `previousBestBpb` across polling cycles via `useRef`

---

### FIX E-002 — Export Button No Implementation [P3]
**Files:** `app/components/TopBar.js`, `app/page.js`

**Root cause:** Export button had `id="btn-export"` but no `onClick` handler.

**Changes:**
1. **TopBar.js** — Added `onExport` prop, wired to button
2. **page.js** — `handleExport()` fetches experiments, generates CSV with headers + summary, triggers browser download via `URL.createObjectURL()` + anchor click

---

### FIX P-038 — Keyboard Navigation [P3]
**Files:** `app/components/Sidebar.js`, `app/components/WorkflowModal.js`, `app/globals.css`

**Root cause:** Interactive elements were `<div>` with `onClick` — not keyboard-accessible.

**Changes:**
1. **Sidebar workflow items** — Added `tabIndex={0}`, `role="button"`, `aria-label`, `onKeyDown` (Enter/Space)
2. **WorkflowModal radio groups** — Added `role="radio"`, `aria-checked`, `tabIndex`, keyboard handlers
3. **Quick Actions** — Converted from `<div>` to `<button disabled>` elements
4. **CSS** — Added `:focus-visible` outlines for all interactive elements (blue outline, 2px offset)

---

### FIX P-039 — Semantic HTML [P4]
**Files:** `app/page.js`, `app/components/ExperimentTable.js`, `app/components/Sidebar.js`, `app/components/WorkflowModal.js`, `app/globals.css`

**Root cause:** Missing heading hierarchy, no table caption, no dialog role.

**Changes:**
1. **Hidden `<h1>`** — "AutoResearch Command Center" with `.sr-only` class
2. **`<caption>`** on experiment table (sr-only): "Experiment results for the active workflow"
3. **`role="dialog"`, `aria-modal="true"`, `aria-labelledby`** on WorkflowModal
4. **Section titles** — Sidebar sections use proper `<h2>` elements with `role="heading"` and `aria-level="2"`
5. **`.sr-only`** CSS utility class added for visually-hidden but screen-reader-accessible content

---

### FIX P-015 — Experiment History [P4, Nice-to-have]
**Status:** Structural placeholder added

**Changes:**
- `ExperimentSearch` component stub exists in `page.js` for future search implementation
- This is P4 nice-to-have; the basic "view experiments per workflow" functionality is working

---

## Toast Notification System (New Feature)
Added a reusable toast notification system used across multiple fixes:
- Auto-dismisses after 4 seconds
- Slide-up animation with type-based coloring (success/error/warning/info)
- Used for: workflow operations, training start/stop, export, cloud rejection
- CSS in `globals.css` with `slideUpToast` and `fadeOutToast` keyframes

---

## Regression Check

- [x] Page fully reloaded (no cache)
- [x] All fixed features work (commit hash, workflow actions, export, cloud warning)
- [x] Adjacent features still work (chart, stats, terminal log, diff viewer)
- [x] Production build passes (`npx next build` — 0 errors)
- [x] No console errors in the browser
- [x] Enterprise: full app regression completed

---

## Self-Annealing Notes

### For `directives/common_issues.md`:
1. **Field name mismatches** between DB schema and UI components are a common error source. Always verify column names against component property access.
2. **In-memory process tracking** in Next.js API routes is unreliable due to hot-module-replacement. Always supplement with PID files or database-backed tracking.
3. **`canvas-confetti`** works well as a lightweight confetti library — 5KB, no dependencies, simple API.
4. **Web Audio API** is a reliable cross-browser way to play sounds without external audio files.
