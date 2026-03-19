# Creative Review — AutoResearch × Claude Code Skills
> Round 2 | Date: 2026-03-19
> Creative Directors: **Andrej Karpathy** 🧠 × **Leonardo da Vinci** 🎨 × **Steve Jobs** 🍎
> Mission: **Kann AutoResearch Claude Code Skills autonom verbessern?**
> Status: Exploration — Strategic Analysis

---

## 1. The Verdict

### 🧠 Karpathy says:
> "Let me be blunt. The AutoResearch loop works because of one thing: **val_bpb doesn't lie.** It's a mathematical function. Same code, same data, same hardware — you get the same number. Now you want to replace that with an LLM judging an LLM's output? That's like replacing a thermometer with someone's cousin who 'can kind of tell if you have a fever.' The feedback loop is fundamentally different — and I'm not convinced it's tight enough."

### 🎨 Da Vinci says:
> "Two worlds in one system — I see the temptation. They share the *philosophy* of autonomous improvement. But they share almost nothing in *mechanism*. Forcing them into one interface is like putting a painting and a sculpture in the same frame. Each deserves its own space. If you build this, build it separately — or you'll create a Frankenstein."

### 🍎 Jobs says:
> "Stop. Before we design anything, answer me one question: **Who wakes up in the morning thinking 'I wish my Claude Skills were 7 points better on a 40-point scale?'** Because that's what Video G shows. A score going from 32 to 39. Be honest — is this a real problem? Or is it a programmer scratching a programmer's itch?"

**The Verdict: JEIN — Nicht jetzt. Konzeptionell spannend, aber das Fundament wackelt.**

---

## 2. Der Loop-Vergleich — Ehrlich

| Kriterium | ML-Training (aktuell) ✅ | Skills-Optimierung (neu) ⚠️ |
|---|---|---|
| **Was wird geändert?** | `train.py` (Code) | `SKILL.md` (Prompt-Text) |
| **Metrik** | `val_bpb` — mathematisch, deterministisch | Eval-Score — LLM-basierter Judge |
| **Objektivität** | 🟢 Absolut. Gleicher Code = gleiches Ergebnis | 🔴 Subjektiv. Gleicher Prompt ≠ gleiches Ergebnis |
| **Loop-Zeit** | 5 Min | 2-5 Min (API-abhängig) |
| **Kosten pro Loop** | Gratis (lokal) / ~$0.05 (Cloud) | ~$0.20+ (10 API-Calls) |
| **Nacht-Run (8h, ~240 Runden)** | Gratis | **~$48** |
| **Gaming-Risiko** | 🟢 Unmöglich — val_bpb ist physikalisch | 🔴 Hoch — Prompt optimiert sich auf den Judge |
| **Ceiling** | Begrenzt durch Modell-Kapazität (physikalisch) | Begrenzt durch Judge-Qualität (künstlich) |
| **Statistische Signifikanz** | 1 Run reicht (deterministisch) | 10+ Runs nötig, trotzdem fragwürdig |
| **Skalierung** | Unendlich (kostenlos local) | Linear teurer mit jedem Sample |

### 🧠 Karpathy's 6-Kriterien-Check (aus Video D)

Video D definiert sechs Voraussetzungen dafür, dass AutoResearch auf ein Problem anwendbar ist:

| # | Voraussetzung | ML-Training | Skills-Optimierung |
|---|---|---|---|
| 1 | **Objektive Metrik** | ✅ val_bpb ist mathematisch | ⚠️ LLM-Judge ist subjektiv |
| 2 | **Schnelle Iteration** | ✅ 5 Min Time-Budget | ✅ 2-5 Min |
| 3 | **Deterministische Evaluation** | ✅ Same input = same output | ❌ Probabilistisch |
| 4 | **Günstiger Loop** | ✅ Lokal kostenlos | ❌ $0.20+ pro Runde |
| 5 | **Klares Optimum** | ✅ Niedrigerer val_bpb = besser | ⚠️ Perfekter Score = möglich, aber was dann? |
| 6 | **Keine Metric-Gaming-Möglichkeit** | ✅ Physikalische Metrik | ❌ LLM kann LLM-Judge gamen |

**Ergebnis: 2 von 6 sauber erfüllt. 2 teilweise. 2 nicht.**

> 🧠 Karpathy: *"2 von 6 ist ein FAIL. Das ist nicht 'fast gut genug' — das ist ein fundamental anderes Problem, das zufällig ähnlich aussieht. Der Loop sieht gleich aus, aber die Physik ist komplett verschieden."*

---

## 3. Die harten Fragen — Ehrliche Antworten

### ❓ 1. Metric Gaming

**Frage:** Wenn ein LLM den Prompt bewertet und ein LLM den Prompt verbessert — optimiert sich der Prompt auf den Evaluator statt auf echte Qualität?

**Antwort: Ja, fast sicher.**

> 🧠 Karpathy: *"Das ist das zentrale Problem. In ML gibt es 'Goodhart's Law': Wenn eine Metrik zum Ziel wird, hört sie auf, eine gute Metrik zu sein. val_bpb kann nicht gegamed werden — es misst tatsächliche Vorhersagequalität. Ein LLM-Judge kann gegamed werden, weil der verbessernde Agent lernt, was dem Judge gefällt — nicht was dem Menschen gefällt."*

> 🍎 Jobs: *"Stell dir vor, Apple's Design-Review wird von einem Algorithmus gemacht. Der Algorithmus sagt 'runde Ecken, 3 Farben, weißer Hintergrund = 10/10'. Dann optimierst du jedes Design so, bis der Algorithmus 10/10 gibt. Hast du ein gutes Design? Nein. Du hast ein algorithmisch-gutes Design. Das sind zwei verschiedene Dinge."*

### ❓ 2. Kosten-Realität

**Frage:** $0.20 × 240 Runden = ~$48 pro Nacht. Wer zahlt das?

**Antwort: Fast niemand, für fast kein Problem.**

> 🍎 Jobs: *"$48 um einen Prompt zu verbessern. Lass das wirken. Ein Freelancer auf Upwork fixiert deinen Prompt in 30 Minuten für $25. Und der Freelancer versteht Kontext. Der Loop nicht."*

> 🧠 Karpathy: *"ML-Training über Nacht ist gratis — das ist der Killer-Vorteil. Sobald du API-Kosten hast, ändert sich die Rechnung fundamental. Die Frage ist nicht 'kann man sich das leisten?' sondern 'ist es den Preis wert?'"*

**Gegenargument (fair):** Für Agenturen die 50+ Skills managen, könnten $48 pro Nacht pro Skill akzeptabel sein — WENN die Verbesserung messbar und konsistent ist.

### ❓ 3. Statistische Signifikanz

**Frage:** 10 Samples — reicht das?

**Antwort: Nein, wahrscheinlich nicht.**

> 🧠 Karpathy: *"In Video G: Score geht von 32/40 auf 39/40. Das sind 7 Punkte. Aber mit nur 10 Samples hast du eine riesige Varianz. Was wenn du den originalen Prompt nochmal 10× testest und er diesmal 36/40 bekommt? Dann war die 'Verbesserung' nur 3 Punkte — statistisch möglicherweise Rauschen. Du brauchst mindestens 30-50 Samples für ein 95%-Konfidenzintervall bei binären Kriterien."*

**Konsequenz:** 50 Samples × $0.02 = $1.00 pro Eval-Runde statt $0.20. Nacht-Run: ~$240. Das tötet den Business Case endgültig.

### ❓ 4. Ceiling Problem

**Frage:** Gibt es ein natürliches Qualitäts-Ceiling?

**Antwort: Ja. Und es ist niedrig.**

> 🎨 Da Vinci: *"Der Evaluator-LLM definiert die Obergrenze. Wenn Claude 3.5 evaluiert, kann der Prompt nie besser werden als das, was Claude 3.5 für 'gut' hält. Das ist ein künstliches Ceiling. Bei val_bpb gibt es ein theoretisches Optimum (Entropie der Sprache), aber es liegt weit jenseits dessen, was aktuelle Modelle erreichen. Bei LLM-Evaluation ist das Ceiling sofort spürbar."*

### ❓ 5. Der ehrliche Vergleich

**Frage:** Hätte ein Mensch die 7-Punkte-Verbesserung in 10 Minuten geschafft?

**Antwort: Wahrscheinlich ja.**

> 🍎 Jobs: *"Wenn der Score von 32 auf 39 geht, haben 7 von 40 binären Checks nicht bestanden. Ein Mensch liest die 7 Fehler, fixt den Prompt, fertig. 10 Minuten. Der AutoResearch-Loop brauchte dafür wie viele Runden? Wenn die Antwort 'mehr als 5' ist, war der Mensch schneller."*

> 🧠 Karpathy: *"Der Wert von AutoResearch für ML-Training ist, dass der Agent dinge entdeckt, die kein Mensch in endlicher Zeit probieren würde. Tausende Architektur-Varianten, über Nacht. Bei einem Prompt mit 40 binären Checks ist der Suchraum trivial — das ist kein Entdeckungsproblem, das ist ein Korrekturproblem."*

### ❓ 6. Feature Creep

**Frage:** Wo ist die Grenze?

**Antwort: Genau hier.**

> 🍎 Jobs: *"Wenn wir Skills hinzufügen, kommt als nächstes: 'Kann es auch Cold Emails optimieren?' Dann: 'Und Landing Pages!' Dann: 'YouTube Thumbnails!' Und plötzlich bist du Zapier mit einem Loop — nicht AutoResearch. Der Kern dieses Produkts ist ML-Training-Optimierung. Das ist eine klare, starke Identität. Verwässere sie nicht."*

> 🎨 Da Vinci: *"Ein Schweizer Taschenmesser kann vieles, aber es malt kein Meisterwerk. Spezialisierung schafft Exzellenz."*

---

## 4. Dashboard-Empfehlung

### Die drei Optionen

| Option | Beschreibung | Karpathy | Da Vinci | Jobs |
|--------|-------------|----------|----------|------|
| **A: Unified** | Ein Dashboard für beides | ❌ "Vermischt Physik mit Vibes" | ❌ "Konzeptionelles Wirrwarr" | ❌ "Feature Creep beginnt hier" |
| **B: Separater Tab** | Skill Lab als neuer Tab | ⚠️ "Technisch möglich" | ⚠️ "Besser, aber erzwungen" | ❌ "Split Attention" |
| **C: Eigenes Produkt** | "SkillForge" als separates Tool | ✅ "Saubere Trennung" | ✅ "Jedes Problem verdient seine eigene Lösung" | ✅ "Zwei fokussierte Produkte > ein verwässertes" |

### Empfehlung: Option C — FALLS überhaupt gebaut wird

> 🎨 Da Vinci: *"Die AutoResearch-Architektur teilt die Philosophie (autonomer Verbesserungsloop), nicht die Mechanik. ML-Training und Prompt-Optimierung sind so verschieden wie Bildhauerei und Kalligraphie — beide schaffen Kunst, aber die Werkzeuge sind grundverschieden. Respektiere das."*

**Aber:** Option C heißt, ein komplett neues Produkt zu bauen. Das ist viel Aufwand für einen ungeklärten Business Case.

---

## 5. Business Case Bewertung

### Wer nutzt es?

| Zielgruppe | Größe | Zahlungsbereitschaft | Problem real? |
|-----------|-------|---------------------|--------------|
| **Solo Claude-User** | Groß | ❌ Niedrig ($0-10/Monat) | ⚠️ "Meine Skills sind okay" |
| **Agenturen** | Klein | ✅ Mittel ($50-200/Monat) | ✅ Qualitätskonsistenz ist echt |
| **Prompt Engineers** | Sehr klein | ⚠️ Mittel | ⚠️ Haben eigene Tools |
| **Enterprise** | Minimal | ✅ Hoch | ❌ Nutzen keine Claude Skills |

> 🍎 Jobs: *"Sei ehrlich: Wie viele Leute haben 10+ Claude Code Skills, die sie aktiv pflegen? Hunderte? Tausende? Das ist maximal ein Nischen-Feature, kein Produkt. Der Markt existiert kaum."*

> 🧠 Karpathy: *"Vergleich: Jeder ML-Forscher hat ein Modell das er verbessern will. Das sind Millionen von potenziellen Nutzern. Claude Skill-Pfleger? Einige tausend, optimistisch."*

---

## 6. Machbarkeits-Tabelle

| Kriterium | Score | Kommentar |
|-----------|-------|-----------|
| **Technische Machbarkeit** | **8/10** | Ja, man kann es bauen. API-Calls, Eval-Pipeline, Loop-Logik — alles lösbar. Technik ist nicht das Problem. |
| **Loop-Eignung** | **3/10** | Nur 2 von 6 Kriterien sauber erfüllt. Nicht-deterministischer Evaluator ist ein fundamentaler Unterschied zu ML-Training. |
| **Dashboard-Fit** | **4/10** | Passt konzeptionell ins Autonomie-Narrativ, aber mechanisch nicht ins bestehende UI. Anderer Datenfluss, andere Metriken, andere Visualisierungen. |
| **Business Value** | **3/10** | Sehr kleine Zielgruppe. Kosten-Nutzen-Verhältnis fragwürdig. $48/Nacht für marginale Prompt-Verbesserung. |
| **Aufwand vs. Nutzen** | **3/10** | Geschätzt 40-80h Entwicklung für ein Produkt mit unklarem Markt. Dieselbe Zeit = 4-8 echte Skills manuell perfektionieren. |
| **Innovation** | **7/10** | Kein direkter Wettbewerber hat das als Produkt. Die Idee ist innovativ — aber Innovation allein validiert keinen Markt. |

**Durchschnitt: 4.7/10** — Unter der Schwelle für „Bauen".

---

## 7. Der konkrete Vorschlag: JEIN — Nicht jetzt

### Warum nicht jetzt:

1. **Der Evaluator ist nicht verlässlich genug.** Ein LLM-Judge ist kein val_bpb. Solange es keine robuste, nicht-gamebare Metrik für Prompt-Qualität gibt, ist der Loop fundamentally fragwürdig.

2. **Der Business Case ist zu dünn.** Wenige potenzielle Nutzer, hohe laufende Kosten, marginaler Mehrwert gegenüber manueller Optimierung.

3. **Feature Creep gefährdet den Kern.** AutoResearch Command Center hat eine klare, starke Identität: ML-Training-Autonomie. Skills einzubauen verwässert diese.

### Was sich ändern müsste (konkrete Trigger):

| Trigger | Was sich ändert |
|---------|----------------|
| **Eval-Modelle werden deterministischer** | Wenn ein LLM-Judge bei 50 Runs < 2% Varianz zeigt → Loop-Eignung steigt von 3 auf 7 |
| **API-Kosten fallen 10×** | Wenn 10 Eval-Calls $0.02 statt $0.20 kosten → Nacht-Run wird $5 statt $48 |
| **Claude Skills Ökosystem wächst 10×** | Wenn 100.000+ Nutzer aktiv Skills pflegen → Business Case wird real |
| **Deterministische Eval-Benchmarks** für Skills | Wenn jemand ein "val_bpb für Prompts" erfindet → alles ändert sich |

### Was man HEUTE schon tun kann:

1. **Architektur vorbereiten.** Das AutoResearch Command Center hat eine saubere API (`/api/engine`, `/api/workflows`). Diese Architektur kann für Skill-Optimierung wiederverwendet werden — WENN der Tag kommt. Abstrakt: "Job-Runner" statt "ML-Training-Runner".

2. **Eval-Framework prototypen.** Ein Python-Script in `execution/` das:
   - Einen Claude Skill nimmt
   - 10× gegen binäre Kriterien evaluiert  
   - Score berechnet + Varianz misst
   - ~20 Zeilen Code, 30 Min Aufwand
   
   Das validiert, wie stabil der Evaluator wirklich ist — ohne UI, ohne Produktentscheidung.

3. **Die EINE Frage beantworten:** (siehe unten)

---

## 8. Die EINE Frage

> **"Wie stabil ist ein LLM-Evaluator wirklich?"**

Bevor irgendetwas gebaut wird, muss diese Frage empirisch beantwortet werden:

1. Nimm einen Claude Skill (z.B. diagram-generator)
2. Definiere 4 binäre Eval-Kriterien
3. Generiere 50 Outputs
4. Evaluiere jeden Output mit Claude als Judge
5. Wiederhole die gesamte Evaluation 3×
6. Miss die Varianz

**Wenn die Varianz < 5% ist:** Die Loop-Eignung steigt drastisch. Skill-Optimierung wird plausibel.
**Wenn die Varianz > 15% ist:** Der Loop misst Rauschen, nicht Qualität. Das Projekt ist tot.

> 🧠 Karpathy: *"Don't build the product. Run the experiment. 50 Samples, 3 Wiederholungen, 1 Stunde Arbeit, $3 API-Kosten. Das beantwortet die Frage definitiv."*

---

## 9. Zusammenfassung der drei Stimmen

### 🧠 Karpathy — "NEIN für jetzt"
> *"Die Idee ist konzeptionell elegant, aber die Physik stimmt nicht. val_bpb ist ein Thermometer. Ein LLM-Judge ist ein Gefühlsbarometer. Du kannst mit einem Gefühlsbarometer keinen autonomen Loop bauen, der über Nacht zuverlässig arbeitet. Lauf das Experiment. Wenn der Evaluator stabil genug ist, rede nochmal mit mir."*

### 🎨 Da Vinci — "JEIN — als eigenes Werk"
> *"Die Idee verdient Respekt — aber sie verdient auch ihren eigenen Raum. Bau es nicht ins Command Center. Wenn du es baust, dann als eigenständiges Instrument mit eigener Identität. 'SkillForge' wäre ein schöner Name. Aber bau es nicht, bevor du die Varianz-Frage beantwortet hast."*

### 🍎 Jobs — "NEIN"
> *"Wer ist der Kunde? Was ist sein Problem? Wie viel zahlt er dafür? Ich höre auf alle drei Fragen keine überzeugenden Antworten. Das ist eine Lösung auf der Suche nach einem Problem. Ich liebe die Ambition, aber: **Focus is about saying no.** Bleibt bei ML-Training. Das ist euer Ding. Werdet darin die Besten."*

---

> *"Die gefährlichste Frage in der Produktentwicklung ist nicht 'Können wir das bauen?' sondern 'Sollten wir das bauen?'"*
> — Steve Jobs (wahrscheinlich)

**Empfehlung: Park it. Validiere den Evaluator. Entscheide danach.**
