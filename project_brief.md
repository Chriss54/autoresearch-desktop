# Project Brief — AutoResearch Command Center
> Generated on 2026-03-18 through the Antigravity Academy Onboarding

## 0. Project Configuration

### Project Type: Hybrid
> Web-App (Dashboard/Command Center) + Automation (autonomer ML-Training-Loop). Das UI ist die Zentrale, die Automation läuft lokal oder in der Cloud.

### Quality Preset: Enterprise
> Bulletproof. Accessibility, Performance, Stability. Der Loop muss über Nacht stabil laufen. Das UI muss professionell und fehlerfrei sein. Der Examiner prüft wie ein Fortune-500 Auditor. Alle Fehler P1-P4 werden gefixt. Max 7 Revisionsrunden.

### Expert Team (Kreis der Exzellenz)
- **Student (Builder):** ML Systems Engineer, Stanford AI Lab — Spezialisierung in Training-Infrastruktur, GPU-Optimierung und autonomen Experimentier-Pipelines. Bridget zwischen ML-Research und Systems Engineering.
- **Examiner (Quality Gate):** Staff ML Infrastructure Engineer, Google DeepMind — 10+ Jahre Erfahrung in Training-Pipeline-Reliability, GPU Memory Optimization und Experiment-Reproduzierbarkeit. Hat tausende OOM-Crashes und Training-Instabilitäten debuggt.
- **Creative Director 1 (Visionary):** Andrej Karpathy — "Software 2.0"-Visionär. Die eleganteste Lösung ist die, die sich selbst verbessert. Simplicity über Complexity, Autonomie über Micromanagement.
- **Creative Director 2 (Visionary):** Leonardo da Vinci — Der Polymath. Kunst × Wissenschaft, obsessive Tiefe, Perfektion durch Verständnis der Grundprinzipien. "Simplicity is the ultimate sophistication."
- **Revision Agent:** Erbt Student-Persona (ML Systems Engineer, Stanford AI Lab)

---

## 1. Vision

**AutoResearch Command Center** — Eine Easy-Access Kommandozentrale für Karpathys autoresearch-Projekt. Macht autonome KI-Forschung für Nicht-Techniker zugänglich.

Das Kernkonzept: Ein AI-Agent modifiziert eigenständig ML-Training-Code, trainiert 5 Minuten, vergleicht Ergebnisse, behält Verbesserungen, verwirft Verschlechterungen — und wiederholt das endlos. Du schläfst, der Agent forscht.

Unser Projekt macht das zugänglich: Ein Web-Dashboard (GitHub Dark Mode Style) als Kommandozentrale, One-Click Start/Stop, Workflow-Builder für verschiedene Forschungsstrategien, und Dual-Execution (lokal auf Mac M4 via MLX oder Cloud via Modal mit NVIDIA GPU).

## 2. Target Audience

Der User selbst — tech-interessiert aber kein Terminal-Nerd. Will die Macht von autonomer KI-Forschung nutzen, ohne in Code und Terminal eintauchen zu müssen. "Easy Access" ist das Designprinzip.

## 3. Functional Requirements

### Must-Haves
- [ ] **Mac-kompatibler Training-Loop** — ML-Training auf Apple Silicon M4 via MLX, gleiche 5-Minuten-Time-Budget-Logik wie das Original
- [ ] **Web-Dashboard** — GitHub Dark Mode Style Command Center, sofort verständlich
- [ ] **One-Click Start/Stop** — Kein Terminal, kein CLI. Button drücken → Loop startet
- [ ] **Live Experiment-Tracker** — Tabelle: Experiment #, Änderung, val_bpb Ergebnis, Status (keep/discard/crash)
- [ ] **Progress-Visualisierung** — Chart: val_bpb über Zeit, mit Markierungen für Records
- [ ] **Workflow-Builder** — Neue Workflows über UI anlegen: Forschungsfokus, Strategie, Constraints, Time Budget, Custom Instructions
- [ ] **Workflow-Library** — Gespeicherte Workflows wiederverwenden, bearbeiten, löschen
- [ ] **Dual-Execution** — Pro Workflow wählen: 🏠 Lokal (Mac/MLX) oder ☁️ Cloud (Modal/NVIDIA)
- [ ] **Stabiler Nacht-Betrieb** — Loop läuft stabil über 8+ Stunden ohne Crash
- [ ] **Experiment-Report** — Zusammenfassung nach Run-Ende: Anzahl Experimente, Verbesserung, beste Änderungen

### Nice-to-Haves
- [ ] **Live Log-Stream** — Terminal-Output im Browser (für Power-User)
- [ ] **Code Diff-Viewer** — Visuell sehen was der Agent am Code geändert hat (vorher/nachher)
- [ ] **Record-Benachrichtigung** — Visueller/akustischer Alert wenn ein neuer val_bpb Rekord gebrochen wird
- [ ] **Mobile Dashboard** — Responsive Layout für Status-Check vom Handy
- [ ] **Experiment-History** — Alle vergangenen Runs durchsuchbar archiviert

## 4. User Flows

### Core Flow: Experiment starten
1. User öffnet Dashboard im Browser (localhost)
2. Sieht Übersicht: letzte Ergebnisse, aktive Workflows, System-Status
3. Wählt einen Workflow aus der Library (oder erstellt neuen)
4. Wählt Execution Target: Lokal oder Cloud
5. Klickt "Start" → Loop beginnt
6. Dashboard zeigt live: aktuelles Experiment, Fortschritt, Ergebnisse
7. Experimente kommen rein, Chart aktualisiert sich
8. User kann jederzeit stoppen
9. Am Ende: Report-Übersicht

### Core Flow: Workflow anlegen
1. User klickt "+ Neuer Workflow"
2. Formular: Name, Forschungsfokus, Strategie, Constraints, Instructions
3. Speichert → erscheint in der Library
4. Kann bearbeitet, dupliziert oder gelöscht werden

## 5. Design & UX

### Stil: GitHub Dark Mode
- **Farbpalette:**
  - Background: `#0d1117` (GitHub Dark)
  - Surface: `#161b22` (Cards, Sidebar)
  - Border: `#30363d`
  - Text Primary: `#f0f6fc`
  - Text Secondary: `#8b949e`
  - Success/Keep: `#3fb950` (Grün)
  - Error/Crash: `#f85149` (Rot)
  - Discard: `#f0883e` (Orange)
  - Accent/Record: `#58a6ff` (Blau)
  - Highlight: `#bc8cff` (Lila)

- **Layout:** Sidebar (Workflows) + Main Content Area (Charts, Tabelle, Logs)
- **Typografie:** Monospace für Code/Daten (JetBrains Mono/Fira Code), Sans-Serif für UI (Inter/Segoe UI)
- **Responsive:** Mobile-fähig — Dashboard angepasst für kleine Screens
- **Animationen:** Subtil — Smooth Transitions, Pulse bei aktiven Experimenten, Konfetti bei neuem Rekord 🎉
- **Inspiration:** GitHub Dashboard, Activity Graphs, PR-Merge-Visualisierung

## 6. Tech Stack

### Frontend
- **Next.js 14+** — React-basiert, App Router, Server Components
- **Recharts** — Für Progress-Charts und Daten-Visualisierung
- **WebSockets (Socket.io)** — Live-Updates von Experiment-Status und Logs

### Backend
- **Next.js API Routes** — REST API für Workflow-CRUD, Experiment-Daten
- **SQLite (better-sqlite3)** — Lokale Datenbank: Workflows, Experiment-Ergebnisse, Settings
- **Node Child Process (child_process)** — Startet Python Training-Loops als Subprocess

### ML / Training (Lokal)
- **MLX** (Apple's native ML Framework) — Optimal für M4 Apple Silicon
- Portierung von `train.py` auf MLX basierend auf macOS-Forks
- `prepare.py` Logik adaptiert für MLX-kompatible Datenformate

### ML / Training (Cloud)
- **Modal** — Serverless GPU Compute (NVIDIA H100)
- Webhook-basierte Integration für Remote-Experiment-Steuerung
- Original PyTorch/CUDA Code für Cloud-Runs

### Versionierung
- **Git** — Branch-basiert wie im Original (`autoresearch/<tag>`)
- Diffs werden für Diff-Viewer extrahiert und im UI angezeigt

### Hardware-Zielplattform
- **Apple M4 Mac** — Primäre Entwicklungs- und Ausführungsplattform
- **Modal Cloud** — Sekundäre Ausführung für Power-Runs

## 7. Success Criteria

- [ ] Browser öffnen → Dashboard → sofort verstehen was passiert
- [ ] One-Click Training-Loop starten (lokal auf Mac M4)
- [ ] Live sehen wie Experimente laufen und Ergebnisse reinkommen
- [ ] Workflows anlegen, speichern und wiederverwenden
- [ ] Zwischen Lokal (Mac) und Cloud (Modal) wählen können
- [ ] Loop läuft stabil über Nacht (8+ Stunden) ohne Crash
- [ ] Morgens klarer Report: was ist passiert, wie viel besser ist das Modell
- [ ] UI sieht aus wie GitHub Dark Mode — clean, professionell, premium
- [ ] Kein Terminal-Wissen nötig um es zu benutzen

## 8. Dealbreakers

- ❌ Terminal-Kenntnisse nötig um das Tool zu benutzen
- ❌ Crashes ohne klare Fehlermeldung
- ❌ Unlesbares oder generisch aussehendes UI
- ❌ Lokales Training funktioniert nicht auf M4 Mac
- ❌ Datenverlust bei Experiment-Ergebnissen

## 9. References

- **Original Repo:** [karpathy/autoresearch](https://github.com/karpathy/autoresearch) — das Basis-Projekt
- **macOS Fork (MLX):** [trevin-creator/autoresearch-mlx](https://github.com/trevin-creator/autoresearch-mlx)
- **macOS Fork:** [miolini/autoresearch-macos](https://github.com/miolini/autoresearch-macos)
- **Design-Referenz:** GitHub Dark Mode Dashboard — Farbpalette, Layout, Typografie
- **Basis-Dateien im Projekt:**
  - `drop_project/README.md` — Original README
  - `drop_project/program.md` — Agent-Instruktionen (wird zu Workflow-Templates)
  - `drop_project/train.py` — Der Code den der Agent modifiziert
  - `drop_project/prepare.py` — Daten-Vorbereitung und Evaluation (read-only)
