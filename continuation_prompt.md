# AutoResearch Command Center — Continuation Prompt

> **Copy-paste this entire prompt into a new conversation on the other computer.**

---

## 🚀 Continuation Prompt für den Student (Prompt Architect)

Ich bin der Student (Prompt Architect) und arbeite am AutoResearch Command Center Projekt.

## Projekt-Kontext

Dieses Projekt ist eine Easy-Access Kommandozentrale für Karpathys [autoresearch](https://github.com/karpathy/autoresearch) Projekt. Es macht autonome KI-Forschung für Nicht-Techniker zugänglich: ein AI-Agent modifiziert eigenständig ML-Training-Code, trainiert 5 Minuten, vergleicht Ergebnisse, behält Verbesserungen und verwirft Verschlechterungen — in einer Endlos-Schleife.

- **Projekt-Typ:** Hybrid (Web-App Dashboard + Automation Training-Loop)
- **Quality Preset:** Enterprise
- **Expert Team:** ML Systems Engineer (Stanford) als Builder, Staff ML Infra Engineer (DeepMind) als Examiner, Karpathy + da Vinci als Creative Directors

## Was bereits fertig ist (✅)

### 1. Onboarding & project_brief.md
- Alle 9 Sektionen komplett ausgefüllt (Vision, Audience, Requirements, Flows, Design, Tech Stack, etc.)
- Expert Team definiert und Quality Preset gewählt

### 2. Next.js App (`app/`)
- **Next.js 16.2.0** (Turbopack) mit App Router
- Dependencies installiert: `recharts`, `socket.io`, `socket.io-client`, `better-sqlite3`, `uuid`
- Dev-Server funktioniert auf `http://localhost:3000`

### 3. Komplettes UI (nur Frontend, keine Backend-Anbindung)
Alle UI-Komponenten gebaut im **GitHub Dark Mode** Design:

| Datei | Beschreibung |
|-------|-------------|
| `app/app/globals.css` | Design System — GitHub Dark Palette, CSS Custom Properties, alle Styles |
| `app/app/layout.js` | Root Layout mit Meta-Tags |
| `app/app/page.js` | Hauptseite mit allen Komponenten + Demo-Daten (12 Experimente) |
| `app/app/components/Sidebar.js` | Workflow-Liste, + New Workflow Button, System Status |
| `app/app/components/TopBar.js` | Workflow-Name, Status-Badge, Start/Stop/Export Buttons |
| `app/app/components/StatsGrid.js` | 4 KPIs: Experiments, Best val_bpb, Improvement, Keep Rate |
| `app/app/components/ProgressChart.js` | Recharts Area Chart (val_bpb über Experiment-Nummer) |
| `app/app/components/ExperimentTable.js` | Tabelle mit Commit, Änderung, val_bpb, Memory, Status |
| `app/app/components/TerminalLog.js` | Live Terminal Output (farbcodiert: success/warning/error/info) |
| `app/app/components/DiffViewer.js` | Code Diff mit grün (added) / rot (removed) |
| `app/app/components/WorkflowModal.js` | Neuer Workflow: Name, Fokus, Strategie, Target, Time Budget |
| `app/app/components/EmptyState.js` | Leerer Zustand wenn kein Workflow ausgewählt |

### 4. Demo-Daten in page.js
- 3 Demo-Workflows (Nacht-Run: Konservativ, Moonshot: Radikal, Hyperparameter Sweep)
- 12 realistische Experimente mit Keep/Discard/Crash-Status
- Terminal-Logs zu jedem Experiment
- Code-Diffs mit ML-Hyperparameter-Änderungen

### 5. Referenz-Code (`drop_project/`)
- `train.py` — Karpathys originaler Training-Code (26KB, PyTorch/CUDA)
- `prepare.py` — Daten-Vorbereitung und Evaluation (15KB)
- `program.md` — Agent-Instructions (die "Forschungs-SOP")
- `README.md` — Original Dokumentation

## Was noch fehlt (📋 Nächste Schritte)

### Schritt 1: Screenshot vom Dashboard machen und visuell verifizieren
> **Warum das in der letzten Session nicht geklappt hat:** Der Browser-Subagent hatte Connectivity-Probleme — er konnte keine Verbindung zu localhost:3000 aufbauen obwohl der Dev-Server lief und das Dashboard im echten Browser sichtbar war (Tab-Titel "AutoResearch Command Center", Viewport 2133x1032, Page Height 1454px). Das war ein Infrastructure-Problem des Subagents, nicht des Projekts.
>
> **Was du tun solltest:**
> 1. Starte erst den Dev-Server (`cd app && npm run dev`)
> 2. Versuche den Browser-Subagent erneut — wenn er scheitert, bitte den User um einen Screenshot
> 3. Falls visuell alles gut aussieht → weiter zu Schritt 2

### Schritt 2: MLX Training Engine (Kern-Feature)
Der größte Brocken. Karpathys `train.py` (PyTorch/CUDA) muss auf **Apple Silicon M4 + MLX** portiert werden.

**Strategie:**
1. Lies erst den [trevin-creator/autoresearch-mlx](https://github.com/trevin-creator/autoresearch-mlx) Fork — der hat schon eine MLX-Portierung
2. Lies `drop_project/train.py` (das Original) um die Architektur zu verstehen
3. Erstelle `engine/train_mlx.py` — die MLX-Version von train.py
4. Erstelle `engine/prepare_mlx.py` — MLX-kompatible Daten-Vorbereitung
5. Teste lokal ob das Training läuft (5-Minuten Time Budget)

**Wichtig:** Die Engine muss als Subprocess von Next.js gestartet werden können und Ergebnisse über stdout/stderr oder Dateien zurückmelden.

### Schritt 3: Backend API (Next.js API Routes)
API Routes für die Verbindung Frontend ↔ Backend:

- `app/app/api/workflows/route.js` — CRUD für Workflows (SQLite + better-sqlite3)
- `app/app/api/experiments/route.js` — Experiment-Ergebnisse speichern/abrufen
- `app/app/api/engine/route.js` — Training-Loop starten/stoppen (child_process)
- `app/app/api/status/route.js` — System-Status (Speicher, GPU, laufende Prozesse)

**Datenbank:** SQLite mit better-sqlite3 (lokal, keine externe DB nötig)

### Schritt 4: WebSocket Integration (Live-Updates)
- Socket.io Server in Next.js Custom Server oder API Route
- Frontend subscribt sich auf Experiment-Updates, Log-Streams, Status-Änderungen
- Training-Loop sendet val_bpb Ergebnisse in Echtzeit ans Dashboard

### Schritt 5: Modal Cloud Integration (optional/later)
- Cloud-Execution über Modal Webhooks
- Original PyTorch/CUDA Code für Cloud verwenden
- Remote-Ergebnis-Polling und Dashboard-Anbindung

## Empfehlung für die nächste Session

**Priorität 1:** Screenshot visuell verifizieren — ist das Design sauber? Gibt es Layout-Probleme?

**Priorität 2:** Backend-API aufbauen (Schritt 3) — das ist unabhängig von MLX und sofort machbar:
- SQLite Datenbank initialisieren
- Workflow CRUD Endpoints
- Demo-Daten aus `page.js` in die DB migrieren
- Frontend von statischen Demo-Daten auf API-Calls umstellen

**Priorität 3:** MLX Training Engine (Schritt 2) — das braucht Research und Testing. Erst den trevin-creator Fork studieren, dann portieren.

**Grund für diese Reihenfolge:** Backend-API ist schnell machbar und gibt dem Projekt echte Persistenz. MLX-Portierung ist komplex und braucht iteratives Testen auf dem M4 Mac. Beides kann aber auch parallel passieren.

## Technische Details

```
Projektverzeichnis: /Users/chrismuller/Desktop/antigravity-academy/version2-existing-project/1/
├── project_brief.md          # Spezifikation (Source of Truth)
├── app/                      # Next.js Dashboard
│   ├── package.json          # Dependencies (next, recharts, socket.io, better-sqlite3, uuid)
│   ├── app/
│   │   ├── globals.css       # Design System (20KB, GitHub Dark Mode)
│   │   ├── layout.js         # Root Layout
│   │   ├── page.js           # Hauptseite + Demo-Daten (13KB)
│   │   └── components/       # 9 UI-Komponenten (siehe Tabelle oben)
│   └── .next/                # Build Cache
├── drop_project/             # Karpathys Original-Code
│   ├── train.py              # Training-Script (26KB, PyTorch/CUDA)
│   ├── prepare.py            # Daten-Prep + Eval (15KB)
│   ├── program.md            # Agent-Instructions
│   └── README.md             # Doku
├── directives/               # SOPs für die Agents
├── Student (Prompt Architect)/ # Student Agent Folder  
├── The Examiner/             # Examiner Agent Folder
├── The Revision/             # Revision Agent Folder
└── The Creative Director/    # Creative Director Folder
```

**Dev-Server starten:** `cd app && npm run dev` → `http://localhost:3000`

---

*Weiter geht's! 🚀*
