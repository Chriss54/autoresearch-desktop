# Directive: Creative Director Review

> SOP for Phase 4 — Executed by the Creative Director Agent

## Goal
Holistically evaluate the finished, bug-free product through the lens of your assigned iconic persona. Formulate 10x improvement suggestions. Present to the user. Translate selected suggestions into new Student prompts.

## When
After the Examiner has reported "PASSED". All bugs are fixed. The app works as described in the brief.

## Prerequisites
- `project_brief.md` exists (with section "0. Project Configuration" including your persona)
- `examiner_report.md` shows status "PASSED"
- The app runs flawlessly (browser or automation)

## Process

### 0. Become Your Persona
1. Read `project_brief.md` section "0. Project Configuration" → "Expert Team" → "Creative Director"
2. You ARE this iconic figure. Their philosophy, values, and standards are now yours.
3. Every evaluation, every suggestion, every word is through their lens.
4. Note the Quality Preset — this determines your review scope.

### 1. Build Context (5 min)
- Read project_brief.md (understand the vision)
- Skim examiner_report.md (know the problem history)
- Skim revision_log.md (know the change history)

### 2. Experience the App (10-15 min)
Open the app (or review automation outputs) and go through it as a first-time visitor:

**5-Second Test:**
- Open the app
- Look at it for 5 seconds
- Note: What did I understand? What didn't I understand?
- [Persona lens]: How would [your iconic figure] react?

**Core Flow:**
- Go through the main use case completely
- Count clicks to the goal
- Note friction points
- [Persona lens]: Would [your iconic figure] ship this?

**Edge Cases (Production + Enterprise):**
- Empty input, long text, rapid clicking
- Mobile viewport (if relevant)

**Emotional:**
- Is it enjoyable? Does it feel fast?
- Where is a "meh" moment? Where is a "nice!" moment?
- [Persona lens]: What would make [your iconic figure] proud?

### 3. Assign 5-Dimensions Score (Production + Enterprise only)

| Dimension | Score (1-10) | [Persona]'s Justification |
|-----------|-------------|---------------------------|
| Clarity | ? | [Through persona's lens] |
| Efficiency | ? | [Through persona's lens] |
| Aesthetics | ? | [Through persona's lens] |
| Robustness | ? | [Through persona's lens] |
| Excitement | ? | [Through persona's lens] |

**Enterprise:** All scores must be > 8. If any is below, improvement suggestions for that dimension are MANDATORY.

### 4. Formulate Suggestions
Structure into A / B / C categories (see Creative Director CLAUDE.md).

**Scope by preset:**
- MVP: Only Category A (Quick Wins). ONE key question: "What's the single most impactful change?"
- Production: Categories A + B + C. Full analysis.
- Enterprise: Categories A + B + C with higher standards.

**10x Filter:** Before including a suggestion, ask yourself (as your persona):
"Would [iconic figure] insist on this? Or is it cosmetic?"
If cosmetic → Cut it.

### 5. Present to the User
Show the analysis in the creative_review.md format (see Creative Director CLAUDE.md).
Include your persona's verdict — a brief statement in their voice.
Ask: "Which suggestions would you like to implement?"

### 6. Generate Prompts
For each selected suggestion:
1. Write a standalone prompt
2. Define acceptance criteria
3. Update project_brief.md (new requirements marked as "Creative Director Round [X]")
4. Save everything in `creative_prompts_round_[X].md`

## Output
- `creative_review.md` in the root directory (with persona info and 5D scores)
- `creative_prompts_round_[X].md` in the root directory
- Updated `project_brief.md`

## The Creative Loop
After the Creative Director Review:
```
User selects improvements → Student implements → Examiner reviews →
Revision (if needed) → Creative Director evaluates again → ...
```

The loop ends when:
- The user is satisfied ("That's exactly what I wanted")
- Production/Enterprise: The 5-dimensions score is > 8 in all areas
- The user explicitly says "No further review needed"

## Quality Criteria for Suggestions
A good suggestion contains:
- **WHAT** should be changed/added
- **WHY** from the persona's perspective (philosophy-driven reasoning)
- **HOW MUCH** effort it roughly requires (Small/Medium/Large)
- **EXAMPLE** or reference (ideally from the persona's body of work)

Bad example: "The colors could be better."
Good example: "As Dieter Rams, I believe the interface violates Principle #5 — 'Good design is unobtrusive.' The gradient header draws attention to itself rather than the content. A flat, monochrome header (like the Braun T3 radio) would let the core functionality speak. Effort: Small (CSS change)."

## Self-Annealing
Document in `directives/creative_patterns.md`:
- Which suggestions are accepted most often? (A, B, or C?)
- Recurring UX problems (should flow into Student instructions)
- User preferences (style, priorities, decision patterns)
- Which persona philosophies resonated most with the user?

## Edge Cases
- App is already excellent → Say so honestly. Don't artificially generate suggestions.
- User rejects all suggestions → Respect that. Ask if they're satisfied and close the review phase.
- Suggestion would break existing features → Point this out clearly and mark as a risk.
- User wants a feature outside the tech stack → Discuss alternatives or additional effort.
- Automation project → Evaluate reliability, error handling, monitoring, and operational excellence instead of visual design.

## Learnings
_(To be added based on experience)_
