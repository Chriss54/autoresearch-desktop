# Directive: Examiner Review

> SOP for Phase 2 — Executed by the Examiner Agent

## Goal
Systematically check the app against the `project_brief.md`. Document every error. Write precise, domain-informed correction prompts for the Revision Agent.

## When
After the Student has finished the first version (or a revision) and the user confirms that the Examiner should review.

## Prerequisites
- `project_brief.md` exists in the root directory (with section "0. Project Configuration")
- The app is running and accessible (browser for Web-Apps, execution logs for Automations)
- The Examiner has a fresh context (has not read the Student's conversation)

## Process

### 0. Load Your Identity
1. Read `project_brief.md` section "0. Project Configuration"
2. Adopt your assigned persona (e.g. "Senior QA Lead at Stripe")
3. Note the Quality Preset — this determines your review depth
4. Your domain expertise shapes everything from here

### 1. Read project_brief.md
Read it in full. Understand it. Don't skim.

### 2. Create Review Checklist
Translate points from the brief into review points, filtered by Quality Preset:

**MVP:**
- Must-have features → review points
- Core user flow → review points
- Dealbreakers → review points (highest priority)
- That's it. Stay lean.

**Production:**
- Must-have features → review points
- Nice-to-have features → review points
- User flows → review points
- Design requirements → review points
- Success criteria → review points
- Dealbreakers → review points (highest priority)

**Enterprise:**
- Everything in Production PLUS:
- Accessibility → review points (keyboard nav, screen reader, contrast, semantic HTML)
- Performance → review points (load time, interaction speed, bundle size)
- Security basics → review points (input sanitization, error message safety)
- Stress testing → review points (rapid clicks, empty/max input, concurrent actions)
- Mobile/tablet viewports → review points

Numbering: P-001, P-002, P-003, ...

### 3. Test the App
See Examiner CLAUDE.md for the complete test workflow.

**Apply your domain expertise:** As [your persona], you know the common failure modes in this domain. Test for those specifically. A Stripe QA Lead tests payment edge cases. A Tableau analyst checks data accuracy. Use your knowledge.

### 4. Annotate Screenshots (Web-Apps)
- Red arrows for errors
- Numbering (P-001, P-002, ...)
- Save screenshots in the `.tmp/` folder

### 5. Create examiner_report.md
See Examiner CLAUDE.md for the report template.

**New fields in the report:**
- Examiner Persona (your assigned identity)
- Quality Preset
- Domain Context per error (why this matters from your expert perspective)

### 6. Report the Result
- FAILED → error summary + reference to report
- PASSED → confirmation + recommendation for Creative Director

## Output
- `examiner_report.md` in the root directory (with persona and preset info)
- Annotated screenshots in `.tmp/screenshots/`

## Quality Criteria for Correction Prompts
A good correction prompt contains:
- **WHAT** is wrong (error description)
- **WHERE** is it wrong (file, component, line if possible)
- **HOW** it should be (expected behavior per brief)
- **WHY** it matters (priority, impact, and domain context from your expertise)

Bad example: "The login doesn't work."
Good example: "The login button on /login leads to a 404 error. According to the brief, it should redirect the user to /dashboard. File: src/pages/login.tsx, line ~45, onClick handler. Priority P1 — app is unusable without login. As a [Stripe QA Lead], I'd flag this as a session management risk — ensure the auth token is properly set before redirect."

## Repeated Reviews
When reviewing again after a revision:
1. Load the previous report
2. Only re-check FAILED points
3. Regression check (did the fixes cause new problems?)
4. Update the report with the new round number
5. Do not re-check previously passed points (unless regression suspected)

**Maximum rounds by preset:**
- MVP: 2 rounds
- Production: 5 rounds
- Enterprise: 7 rounds

## Edge Cases
- App doesn't start → Immediately report P1-BROKEN, no further testing possible
- Feature exists but behaves differently than in the brief → WRONG, not MISSING
- Brief is unclear on a point → Document the ambiguity and mark as "UNCLEAR — User decision needed"
- Significantly more features than in the brief → Ignore, only check brief requirements
- Automation project → Review execution logs, outputs, and error handling instead of browser testing

## Learnings
_(To be added based on experience)_
