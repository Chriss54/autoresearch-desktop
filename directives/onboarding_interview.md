# Directive: Onboarding Interview

> SOP for Phase 0 — Executed by the Student Agent

## Goal
Generate a complete `project_brief.md` that serves as the shared source of truth for all agents. This includes the project configuration (type, quality preset, expert team) and the full project specification.

## When
Always at the start of a new project. Before any code is written.

## Process

### 1. Welcome the User
"Willkommen in der Antigravity Academy! Bevor wir loslegen, stelle ich dir ein paar Fragen, damit ich genau weiß, was du brauchst. Das dauert ca. 5 Minuten und sorgt dafür, dass alle Experten im Team auf dasselbe Ziel hinarbeiten."

### 2. Block 0 — Project Configuration (Der Kreis der Exzellenz)

This is the NEW first block. Three things are decided here:

**Step 1: Project Type**
Ask what kind of project this is. Explain each option clearly:
- Web-App: Interactive browser application
- Automation / Workflow: Background processes, API integrations
- Hybrid: Both combined

See `directives/persona_selection.md` for the exact presentation format.

**Step 2: Quality Preset**
Ask for the quality level. Explain each option with clear use cases so the user understands WHEN to choose WHICH:
- MVP: Fast validation, demos, prototypes
- Production: Real users, public-facing, solid quality
- Enterprise: Mission-critical, bulletproof

See `directives/quality_presets.md` for the exact presentation format with descriptions.

**Step 3: Expert Team**
Based on the project type and any initial description, suggest an expert team:
- Student (Builder): Domain-specific developer
- Examiner (Quality Gate): Domain-specific reviewer
- Creative Director (Visionary): Iconic figure

See `directives/persona_selection.md` for the auto-suggest logic and presentation format.

Wait for the user to confirm or customize each suggestion.

### 3. Conduct the 5 Interview Blocks
See Student CLAUDE.md, section "Phase 0: The Onboarding Interview" — Blocks 1 through 5.

**Important:**
- Ask the questions block by block, not all at once
- After each block, briefly summarize what you understood
- Ask: "Is that correct? Is anything missing?"
- If the user is unsure, offer examples or suggestions
- For Automation/Hybrid projects: include the automation-specific questions in each block

### 4. Generate project_brief.md
Create the document in the root directory following the template in Student CLAUDE.md.

**IMPORTANT:** The new template starts with section "0. Project Configuration" which includes:
- Project Type
- Quality Preset (with explanation)
- Expert Team (all four roles with backgrounds and reasoning)

### 5. Validation
Show the user the finished brief and ask:
"Hier ist dein Project Brief. Bitte prüfe, ob alles korrekt und vollständig ist. Soll ich etwas ändern?"

### 6. Confirmation
Only after explicit confirmation ("Yes, looks good" / "That's correct" / etc.) begin with implementation.

## Output
- `project_brief.md` in the root directory (with Project Configuration section)

## Edge Cases
- User has no clear idea → Offer 3 concrete options
- User wants features that contradict each other → Point this out and ask for priority
- User wants too much at once → Suggest an MVP and mark the rest as nice-to-have
- User already has a finished prompt → Still translate it into the project_brief.md format so all agents can work with it
- User doesn't know which persona to choose → Explain the suggestion and why it fits, offer alternatives
- User wants an unusual Creative Director (e.g. a fictional character) → Accept it, research/infer their philosophy
- User wants to change the preset mid-project → Document the change, notify that this affects all agents

## Learnings
_(To be added based on experience)_
