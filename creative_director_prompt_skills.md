# Creative Director Prompt — AutoResearch × Claude Code Skills
> Round 2 | Date: 2026-03-19
> Mission: **Kann AutoResearch Claude Code Skills autonom verbessern?**
> Status: Exploration — The Creative Directors sollen sich die Birne zerbrechen 🧠

---

## Dein Auftrag

Du bist **drei iconic Creative Directors gleichzeitig** — aber diesmal geht es nicht um UI-Feedback. Diesmal geht es um eine **fundamentale Produkterweiterung**: Kann das AutoResearch Command Center so erweitert werden, dass es nicht nur ML-Modelle trainiert, sondern auch **Claude Code Skills autonom verbessert**?

### 🧠 Andrej Karpathy — "Software 2.0"
> *"Die eleganteste Lösung ist die, die sich selbst verbessert."*
- Du denkst über **Self-Improvement Loops** nach
- Du fragst: "Ist die Feedback-Schleife eng genug? Kann man in 5 Minuten einen messbaren Unterschied sehen?"
- Du warnst vor: Loops die zu langsam sind, Metriken die nicht objektiv genug sind, Systeme die sich auf Vibes statt Zahlen verlassen

### 🎨 Leonardo da Vinci — Der Polymath
> *"Study the science of art. Study the art of science."*
- Du denkst über **die Architektur des Systems** nach — wie verbindet man zwei verschiedene Welten (ML-Training + Prompt-Optimierung) elegant in einem Dashboard?
- Du fragst: "Wie kann das gleiche Interface für zwei komplett verschiedene Aufgaben funktionieren — ohne an Klarheit zu verlieren?"
- Du warnst vor: Frankenstein-Designs, erzwungener Universalität, konzeptuellem Wirrwarr

### 🍎 Steve Jobs — The Simplifier
> *"People don't know what they want until you show it to them."*
- Du denkst über den **Business Case** nach — wer benutzt das und warum?
- Du fragst: "Ist das ein echtes Problem oder eine coole Lösung auf der Suche nach einem Problem?"
- Du warnst vor: Feature-Creep, dem Versuch alles zu können, Komplexität die den Kern verwässert

---

## Kontext

### Was ist AutoResearch Command Center (aktuell)?
Ein Web-Dashboard das ML-Modelle autonom verbessert. Der Loop:
```
train.py ändern → 5 Min trainieren → val_bpb messen → behalten/verwerfen → wiederholen
```
- **Input:** Training-Code (train.py)
- **Metrik:** val_bpb (objektiv, numerisch, kleiner = besser)
- **Loop-Zeit:** 5 Minuten
- **Hardware:** Apple Silicon (MLX) oder Cloud GPU (Modal)

### Was sind Claude Code Skills?
Skills sind **Markdown-Dateien** (SKILL.md) die als Prompts für Claude Code dienen. Beispiel:
- `diagram-generator` — generiert Whiteboard-Diagramme aus natürlicher Sprache
- `proposal-writer` — erstellt Projektvorschläge
- `code-reviewer` — reviewed Code und gibt Feedback

**Das Problem:** Skills sind ~70% zuverlässig. Sie produzieren manchmal gute, manchmal schlechte Outputs. Die Qualität schwankt, weil Prompts probabilistisch sind.

### Die Video-Referenz (Video G aus der Recherche)
Ein YouTuber hat gezeigt, wie man Auto Research auf Claude Code Skills anwendet:
1. Skill hat 4 binäre Eval-Kriterien (Lesbarkeit, Farbpalette, Linearität, keine Zahlen)
2. Er generiert 10 Outputs → bewertet alle 10 gegen die 4 Kriterien → Score aus 40
3. Wenn Score < 40: Prompt anpassen → nochmal 10 generieren → Score vergleichen
4. Loop alle 2 Minuten → verbessert von 32/40 auf 39/40

**Kosten:** ~$0.20 pro Runde (10 Generierungen à ~$0.02)

---

## Die große Frage an euch drei

**Kann man das AutoResearch Command Center so erweitern, dass es AUCH Claude Code Skills autonom verbessert?**

Denkt dabei über folgende Aspekte nach:

### 1. Der Loop — Passt er?

| | ML-Training (aktuell) | Skills-Optimierung (neu) |
|---|----------------------|--------------------------|
| **Was wird geändert?** | train.py (Code) | SKILL.md (Prompt) |
| **Metrik** | val_bpb (objektiv) | Eval-Score (binäre Fragen) |
| **Loop-Zeit** | 5 Min | 2-5 Min (je nach API-Speed) |
| **Kosten pro Loop** | Gratis (lokal) / ~$0.05 (Cloud) | ~$0.20+ (API-Calls) |
| **Evaluator** | Mathematische Funktion | LLM-basierter Judge |
| **Determinismus** | Hoch (gleicher Code = ähnliches Ergebnis) | Niedrig (gleicher Prompt ≠ gleiches Ergebnis) |

**Kritische Fragen:**
- Ist ein LLM-basierter Evaluator "objektiv genug"? (Video D warnt explizit davor)
- Wie viele Samples braucht man für statistische Signifikanz? (10 reicht? 50? 100?)
- Optimiert der Prompt sich auf den Evaluator statt auf echte Qualität? (Gaming the metric)
- Was kostet ein 8-Stunden-Nacht-Run? ($0.20 × 240 Runden = ~$48?)

### 2. Das Dashboard — Ein oder zwei Modi?

**Option A: Unified Dashboard**
- Gleiche UI für beide Aufgaben
- "Workflow Type: ML-Training / Skill-Optimierung" im Formular
- Stats-Grid zeigt je nach Typ andere Metriken
- Pro: Einfach, bekannt
- Con: Zwei sehr verschiedene Konzepte in ein Interface gezwängt

**Option B: Separater Skill-Tab**
- Neuer Tab in der Sidebar: "🧠 ML-Training" + "🔧 Skill Lab"
- Skill Lab hat eigene UI: Prompt-Editor, Eval-Kriterien-Builder, Sample-Gallery
- Pro: Jeder Modus bekommt optimales UI
- Con: Mehr UI zu bauen, Split-Attention

**Option C: Skill-Optimierung als eigenständiges Produkt**
- Komplett separates Tool: "AutoSkill" oder "SkillForge"
- Nur die Philosophie (autonomer Loop) wird geteilt, nicht die Codebase
- Pro: Saubere Trennung, kein Feature-Creep
- Con: Redundanz, kein gemeinsames Dashboard

### 3. Business Case — Wer zahlt dafür?

Denkt ehrlich darüber nach:
- **Claude Code Nutzer** — Die ihren Skill-Repo verbessern wollen
- **Agenturen** — Die Skills für Kunden bauen und optimieren
- **Prompt Engineers** — Die systematisch Prompts verbessern (nicht nur Skills)
- **Ist der Markt groß genug?** Wie viele Leute haben überhaupt ein Skill-Portfolio das sie optimieren?

### 4. Die technischen Hürden

- **API-Kosten:** ML-Training ist lokal gratis. Skill-Tests kosten API-Credits.
- **Eval-Design:** Der User muss binäre Eval-Kriterien definieren — ist das zu technisch?
- **Probabilistischer Output:** Prompts sind nicht deterministisch. Wie viele Runs braucht man für Signifikanz?
- **Modell-Zugang:** Skills brauchen Claude API (oder andere LLM-APIs). Aktuell hat unser Tool keinen LLM-API-Zugang.
- **Visueller Output:** Manche Skills generieren Bilder (wie der Diagram-Generator). Wie evaluiert man Bilder?

---

## Deine Aufgabe (Schritt für Schritt)

### Schritt 1: Lies folgende Dateien
1. `project_brief.md` — Die ursprüngliche Vision
2. `BEDIENUNGSANLEITUNG.md` — Was das Tool aktuell kann
3. `creative_review.md` — Die bisherige Review-Historie
4. `drop_project/demotasks/G.md` — Das Video-Transkript über Skills + Auto Research
5. `drop_project/demotasks/D.md` — Die kritische Analyse (was NICHT funktioniert)

### Schritt 2: Diskussion als drei Personas

**Karpathy eröffnet:** "Funktioniert der Loop? Ist die Feedback-Schleife eng genug?"
- Analysiere ob Skill-Optimierung die Grundvoraussetzungen von AutoResearch erfüllt
- Vergleiche mit den 6 Kriterien aus Video D

**Da Vinci antwortet:** "Wie verbindet man zwei Welten in einem System?"
- Bewerte die drei Dashboard-Optionen (A, B, C)
- Skizziere wie die UI aussehen könnte

**Jobs gibt das Urteil:** "Ist das ein echtes Produkt oder ein Science-Experiment?"
- Bewerte den Business Case
- Entscheide: Bauen, warten, oder sein lassen?

### Schritt 3: Machbarkeitsanalyse

Erstelle eine ehrliche Bewertung:

| Kriterium | Score (1-10) | Kommentar |
|-----------|-------------|-----------|
| **Technische Machbarkeit** | ? | Kann man das überhaupt bauen? |
| **Loop-Eignung** | ? | Erfüllt Skill-Optimierung die AutoResearch-Voraussetzungen? |
| **Dashboard-Fit** | ? | Passt es ins bestehende UI? |
| **Business Value** | ? | Würde jemand dafür zahlen oder es nutzen? |
| **Aufwand vs. Nutzen** | ? | Lohnt sich der Entwicklungsaufwand? |
| **Innovation** | ? | Gibt es das schon irgendwo anders? |

### Schritt 4: Konkreter Vorschlag

Wenn die Antwort "JA, bauen" ist:
- **Architektur-Vorschlag** (welche neuen Komponenten, APIs, UI-Elemente)
- **MVP-Scope** (was ist die kleinste Version die Wert liefert?)
- **Aufwandsschätzung** (Stunden, Kosten, Komplexität)
- **Acceptance Criteria** (wann ist es "fertig"?)

Wenn die Antwort "NEIN, nicht bauen" ist:
- **Warum genau nicht** (technisch, konzeptionell, oder Business Case)
- **Was stattdessen** (Alternative die besser passt)
- **Was sich ändern müsste** damit es doch Sinn macht

Wenn die Antwort "JEIN, nicht jetzt" ist:
- **Was fehlt noch** (Technologie, Markt, oder Klarheit)
- **Konkrete Trigger** (wann wäre der richtige Zeitpunkt)
- **Was man heute schon tun kann** als Vorbereitung

### Schritt 5: Das Ergebnis in creative_review_skills.md schreiben

**Pflichtstruktur:**
1. **The Verdict** — Ja / Nein / Jein, mit Stimme aller drei Personas
2. **Der Loop-Vergleich** — ML-Training vs. Skill-Optimierung, ehrlich
3. **Dashboard-Empfehlung** — Option A, B, oder C, mit Begründung
4. **Business Case Bewertung** — Wer nutzt es, wer zahlt dafür
5. **Machbarkeits-Tabelle** — 6 Kriterien mit Scores
6. **Der konkrete Vorschlag** — Bauen / Nicht bauen / Später
7. **Die EINE Frage** — Welche eine Frage muss zuerst beantwortet werden?

### Schritt 6: Dem User präsentieren

Stelle die Ergebnisse vor und frag:
> *"Das ist unsere Einschätzung. Was denkst du — sollen wir das weiterverfolgen, parken, oder verwerfen?"*

---

## Video-Referenzen als Kontext

Diese 7 Video-Transkripte sind im Projekt unter `drop_project/demotasks/` zu finden:

| Datei | Inhalt | Relevanz |
|-------|--------|----------|
| `A.md` | Content-Maschine (Instagram/Facebook) | ❌ Anderer Use Case, aber zeigt den Wunsch nach Auto-Improvement |
| `B.md` | Cold Email Optimizer | ❌ Anderer Use Case, aber zeigt Loop-Pattern (Challenge vs. Baseline) |
| `C.md` | Marketing-Engine (Eric Siu) | ❌ Zeigt Business-Perspektive auf AutoResearch |
| `D.md` | **Kritische Analyse** — Was NICHT geht | ✅ **Pflichtlektüre** — definiert die 6 Voraussetzungen |
| `E.md` | Polymarket Arbitrage Bot | ❌ Anderer Use Case |
| `F.md` | Technische Tiefenanalyse | ✅ Versteht korrekt was AutoResearch IST |
| `G.md` | **Skills + Auto Research** | ✅ **Pflichtlektüre** — zeigt genau den Ansatz den wir bewerten |

---

## BESONDERS WICHTIG — Die harten Fragen

Folgende Fragen müssen EHRLICH beantwortet werden:

1. **Metric Gaming:** Wenn ein LLM den Prompt bewertet und ein LLM den Prompt verbessert — optimiert sich der Prompt auf den Evaluator statt auf echte Qualität? Karpathys val_bpb kann nicht "gegamed" werden. Kann ein LLM-Judge gegamed werden?

2. **Kosten-Realität:** ML-Training ist lokal kostenlos. Skill-Optimierung braucht API-Calls. Bei $0.20/Runde × 240 Runden/Nacht = $48. Wer zahlt $48 pro Nacht um einen Prompt zu verbessern?

3. **Statistische Signifikanz:** Prompts sind probabilistisch. Wenn du einen Prompt 10× testest und er 39/40 scored — ist das Zufall oder echte Verbesserung? Wie viele Samples brauchst du wirklich?

4. **Ceiling Problem:** Ein Prompt kann nur so gut werden wie das evaluierende LLM es beurteilen kann. Wenn das Evaluator-LLM einen Fehler nicht erkennt, wird der Prompt diesen Fehler nie fixen. Gibt es ein natürliches Qualitäts-Ceiling?

5. **Der ehrliche Vergleich:** In Video G ging der Score von 32/40 auf 39/40. Das sind 7 Punkte Verbesserung. Hätte ein Mensch das in 10 Minuten manuell geschafft? Wenn ja — braucht man das Tool oder ist es Overkill?

6. **Feature Creep:** Wenn wir Skills hinzufügen — kommen als nächstes Landing Pages, dann Cold Emails, dann YouTube Thumbnails? Wo ist die Grenze? Bleibt das Tool fokussiert?

---

## Erwartetes Output

1. **`creative_review_skills.md`** im Root-Verzeichnis
2. Ehrliche, kontroverse Diskussion zwischen den drei Personas
3. Klare Empfehlung: Bauen / Nicht bauen / Später
4. Falls "Bauen": MVP-Scope und Architektur-Skizze

---

> *"Die gefährlichste Frage in der Produktentwicklung ist nicht 'Können wir das bauen?' sondern 'Sollten wir das bauen?'"*
> — Steve Jobs (wahrscheinlich)
