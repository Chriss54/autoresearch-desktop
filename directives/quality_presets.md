# Directive: Quality Presets

> SOP for Phase 0 (Block 0) — Selected during Onboarding, affects ALL agents

## Goal
Let the user choose a quality level BEFORE the build starts. The preset cascades through every phase — it determines how the Student builds, how strictly the Examiner reviews, and how far the Creative Director pushes.

## When
During onboarding (Block 0), after the project type is selected and before the expert team is assembled.

## The Three Presets

### MVP — "Ship it fast"

> **Für wen:** Du willst schnell testen, ob die Idee funktioniert. Ein Prototyp, den du Leuten zeigen kannst. Perfekt für Validierung, Demos, oder wenn du in wenigen Stunden ein Ergebnis brauchst.

**What it means for each agent:**

| Agent | Behavior |
|-------|----------|
| **Student** | Focus on core functionality only. Minimal styling (clean but not polished). No error handling for edge cases. No animations. Hardcoded values where acceptable. Speed over elegance. |
| **Examiner** | Test ONLY must-have features from the brief. Ignore visual polish, responsive design, edge cases. Pass/Fail based purely on: "Does the core flow work?" |
| **Creative Director** | Only Category A (Quick Wins). No deep analysis. Focus on: "What ONE thing would make the biggest difference?" Skip the 5D scoring. |
| **Revision** | Fix only P1 (Critical) errors. P2-P4 are deferred. Maximum 2 revision rounds. |

**Typical use cases:** Hackathon projects, proof of concepts, investor demos, idea validation, personal tools

---

### Production — "Build it right"

> **Für wen:** Du baust etwas, das Leute wirklich benutzen sollen. Es muss gut aussehen, zuverlässig funktionieren und eine solide User Experience bieten. Der Standard für die meisten Projekte.

**What it means for each agent:**

| Agent | Behavior |
|-------|----------|
| **Student** | All must-haves AND nice-to-haves. Proper error handling. Responsive design. Loading states. Clean, maintainable code. Consistent styling. |
| **Examiner** | Full review: all features, user flows, design requirements, success criteria. Visual and UX checks included. Edge case testing (empty states, long text, rapid clicks). |
| **Creative Director** | Full analysis with 5D scoring. Categories A + B + C. Thorough user perspective testing. Detailed improvement suggestions. |
| **Revision** | Fix all errors P1-P3. P4 at discretion. Up to 5 revision rounds. Regression testing required. |

**Typical use cases:** Client projects, public-facing apps, SaaS products, portfolio pieces, team tools

---

### Enterprise — "Bulletproof"

> **Für wen:** Maximale Qualität. Das Projekt muss unter allen Umständen funktionieren — auch bei unerwartetem Input, hoher Last oder böswilligen Nutzern. Für Projekte, bei denen Fehler teuer sind.

**What it means for each agent:**

| Agent | Behavior |
|-------|----------|
| **Student** | Everything in Production PLUS: Accessibility (WCAG 2.1 AA minimum). Performance optimization (Lighthouse > 90). Input validation and sanitization. Proper error boundaries. Semantic HTML. Keyboard navigation. Security basics (XSS prevention, CSRF tokens if applicable). Comprehensive loading/error/empty states. |
| **Examiner** | Everything in Production PLUS: Accessibility audit (screen reader, keyboard-only navigation). Performance check (load time, bundle size). Security basics review. Stress testing (rapid input, concurrent actions). Mobile + tablet testing. The 5D score from Creative Director must be > 8 in ALL dimensions to pass. |
| **Creative Director** | Everything in Production PLUS: 5D score must reach > 8 in all dimensions. If any dimension is < 8, specific improvement suggestions are MANDATORY. Focus on robustness and professional polish. The bar is: "Would a Fortune 500 company put their name on this?" |
| **Revision** | Fix ALL errors P1-P4. No exceptions. Up to 7 revision rounds. Full regression testing after every fix. If after 5 rounds errors remain, detailed escalation report with root cause analysis. |

**Typical use cases:** Production SaaS, enterprise tools, anything handling user data, client deliverables with contractual quality requirements, public APIs

---

## How to Present in the Wizard

Ask the user:

> "**Welches Quality Level soll dein Projekt haben?**
>
> **MVP** — Schnell & funktional. Fokus auf den Kern, kein Feinschliff. Ideal zum Testen einer Idee oder für Demos. Dein Examiner prüft nur, ob der Core-Flow läuft.
>
> **Production** *(Empfohlen für die meisten Projekte)* — Solide & vollständig. Gutes Design, Error-Handling, responsive. Dein Examiner prüft alles gründlich.
>
> **Enterprise** — Bulletproof. Accessibility, Performance, Security-Basics. Dein Examiner prüft wie ein Fortune-500 Auditor. Dauert länger, aber das Ergebnis hält allem stand.
>
> Welches Preset passt zu deinem Projekt?"

## How to Document

The selected preset is stored in `project_brief.md` under section "0. Project Configuration":

```markdown
## 0. Project Configuration
### Quality Preset: [MVP / Production / Enterprise]
> [One-line explanation of what this means for this specific project]
```

## Preset Escalation

Users can upgrade the preset mid-project:
- MVP → Production: Student adds error handling, responsive design, polish. Examiner re-reviews with full checklist.
- Production → Enterprise: Student adds accessibility, performance optimization, security. Examiner conducts extended review.

Downgrading is discouraged but possible. Document the reason in `project_brief.md`.

## Learnings
_(To be added based on experience — which presets work best for which project types, common upgrade triggers)_
