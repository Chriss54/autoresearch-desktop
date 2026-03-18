# Directive: Revision Cycle

> SOP for Phase 3 / 3.5 — Executed by the Revision Agent

## Goal
Systematically fix all in-scope errors documented in `examiner_report.md`. Do not introduce new problems. Use domain expertise for smarter fixes. Update directives with learnings.

## When
After the Examiner has created their report and the user wants to kick off the revision.

## Prerequisites
- `examiner_report.md` exists and contains errors
- `project_brief.md` exists as reference (including section "0. Project Configuration")
- The app is editable (code access available)

## Process

### 0. Load Your Identity
1. Read `project_brief.md` section "0. Project Configuration"
2. You inherit the Student's persona — same domain expert, now in fix mode
3. Note the Quality Preset — this determines scope and max rounds

### 1. Analyze the Report
1. Read `examiner_report.md` in full
2. Count errors by priority: P1 / P2 / P3 / P4
3. Filter by preset:
   - MVP: Only P1 errors in scope
   - Production: P1-P3 in scope
   - Enterprise: ALL P1-P4 in scope
4. Plan the order: P1 first, then descending
5. Estimate total effort: A few minutes / Several hours / Significant

### 2. Implement Fixes
For each error:
1. Read the correction prompt
2. Locate the code
3. Apply domain expertise: What's the root cause?
4. Implement a minimal, surgical fix
5. Test (browser for web, execution for automation)
6. Regression check (depth based on preset)
7. Document in `revision_log.md`

### 3. Wrap Up
1. Do a full run through the app one more time
2. Finalize revision_log.md (with persona and preset info)
3. Update directives (Self-Annealing)
4. Report to the user

## Output
- `revision_log.md` in the root directory (with persona and preset info)
- Updated directives (if learnings exist)
- Fixed app

## The Loop (Phase 3.5)
The cycle repeats:
```
Examiner reviews → Errors found → Revision fixes → Examiner reviews again → ...
```

**Exit criterion:** The Examiner reports "PASSED — 0 errors" (within preset scope).

**Maximum iterations by preset:**
- MVP: 2 rounds
- Production: 5 rounds
- Enterprise: 7 rounds

If max rounds reached and errors remain, escalate to the user:
"We're in round [X] and there are still [Y] open errors. Would you like to look at the remaining issues yourself, or should I try a different approach?"

## Regression Prevention Checklist
After each fix:
- [ ] Page fully reloaded (no cache) / automation re-executed?
- [ ] Fixed feature works?
- [ ] Adjacent features still work?
- [ ] If global files were changed: entire app tested?
- [ ] No console errors in the browser / no exceptions in logs?
- [ ] Enterprise: full app regression completed?

## Self-Annealing Triggers
Update directives when:
- A fix required an unexpected workaround
- An API behaves differently than documented
- A package requires a specific version
- A pattern repeatedly leads to errors
- An Examiner prompt was imprecise (document what was missing)
- Your domain expertise revealed a non-obvious root cause

## Edge Cases
- Correction prompt is unclear → Document in revision_log.md and report to user
- Fix causes a new bug → Document both fixes, increase regression risk
- Code access to a specific file is missing → Report to user
- Error is not actually an error (brief is ambiguous) → Mark as "UNCLEAR" and ask the user
- Automation project → Test via execution logs, output verification, and error monitoring

## Learnings
_(To be added based on experience)_
