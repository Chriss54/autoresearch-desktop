# 📖 AutoResearch Command Center — Bedienungsanleitung

> **Version 1.0** · Stand: März 2026  
> Für macOS mit Apple Silicon (M1/M2/M3/M4)

---

## Inhaltsverzeichnis

1. [Was ist AutoResearch?](#1-was-ist-autoresearch)
2. [Voraussetzungen](#2-voraussetzungen)
3. [Installation & Erster Start](#3-installation--erster-start)
4. [Die Benutzeroberfläche](#4-die-benutzeroberfläche)
5. [Deinen ersten Workflow erstellen](#5-deinen-ersten-workflow-erstellen)
6. [Training starten & beobachten](#6-training-starten--beobachten)
7. [Ergebnisse verstehen](#7-ergebnisse-verstehen)
8. [Cloud-Training mit Modal](#8-cloud-training-mit-modal)
9. [Demo-Workflow & Guided Tour](#9-demo-workflow--guided-tour)
10. [Daten exportieren](#10-daten-exportieren)
11. [Online, Offline & Vercel — Was geht?](#11-online-offline--vercel--was-geht)
12. [Fehlerbehebung](#12-fehlerbehebung)
13. [Tastenkürzel](#13-tastenkürzel)
14. [Glossar](#14-glossar)

---

## 1. Was ist AutoResearch?

AutoResearch ist deine persönliche **Kommandozentrale für autonome KI-Forschung**. 

Stell es dir so vor: Du gibst einen Forschungsauftrag, drückst „Start", und ein KI-Agent experimentiert autonom — während du schläfst, arbeitest, oder Netflix schaust. Am nächsten Morgen öffnest du die App und siehst: *12 Experimente durchgeführt, 5 Verbesserungen gefunden.*

**Was die App macht:**
- 🧠 Trainiert ein kleines Sprachmodell (GPT) automatisch
- 🔬 Testet verschiedene Architekturen, Hyperparameter und Optimierungen
- ✅ Behält was funktioniert, verwirft was nicht klappt
- 📊 Zeigt dir den Fortschritt in Echtzeit — Grafiken, Tabellen, Live-Terminal

**Was du NICHT brauchst:**
- Keine KI-Vorkenntnisse
- Keine Programmierkenntnisse
- Kein Cloud-Account (optional, für schnelleres Training)

---

## 2. Voraussetzungen

### Muss vorhanden sein

| Was | Minimum | Empfohlen |
|-----|---------|-----------|
| **Mac** | Apple M1 | Apple M4 |
| **macOS** | 14.0 (Sonoma) | 15.0+ |
| **RAM** | 8 GB | 16 GB |
| **Festplatte** | 2 GB frei | 10 GB |
| **Node.js** | 20.x | 22.x |
| **Python** | 3.10 | 3.12 |
| **uv** (Python-Paketmanager) | beliebig | aktuell |

### Prüfen, ob alles da ist

Öffne die App **Terminal** (Spotlight: `⌘ + Leertaste`, tippe „Terminal", Enter).

```bash
node --version          # Sollte v20.x oder höher zeigen
python3 --version       # Sollte 3.10 oder höher zeigen
uv --version            # Sollte eine Versionsnummer zeigen
```

> **Noch nicht installiert?**
> - **Node.js**: [nodejs.org](https://nodejs.org) → die „LTS"-Version herunterladen
> - **uv**: Im Terminal: `curl -LsSf https://astral.sh/uv/install.sh | sh`

---

## 3. Installation & Erster Start

### Schritt 1: Projekt öffnen

Öffne das Terminal und navigiere zum Projekt:

```bash
cd ~/ev/autosearch
```

### Schritt 2: Frontend-Abhängigkeiten installieren

```bash
cd app
npm install
```

> ⏱ Das dauert beim ersten Mal ca. 30–60 Sekunden.

### Schritt 3: Engine-Abhängigkeiten installieren

```bash
cd ../engine
uv sync
```

### Schritt 4: App starten

```bash
cd ../app
npm run dev
```

Du siehst in der Konsole:

```
▲ Next.js 16.2.0 (Turbopack)
- Local: http://localhost:3000
```

### Schritt 5: Im Browser öffnen

Öffne **Safari** oder **Chrome** und gehe zu:

```
http://localhost:3000
```

🎉 **Fertig!** Du siehst jetzt das AutoResearch Command Center.

> **💡 Tipp:** Lass das Terminal-Fenster offen. Sobald du es schließt, stoppt die App.

---

## 4. Die Benutzeroberfläche

Die App hat fünf Hauptbereiche:

```
┌─────────────────────────────────────────────────────┐
│  🧠 AutoResearch          [○ BEREIT] [🏠 LOKAL]     │  ← TopBar
│  Command Center           [▶ Start] [⏹ Stop] [📤]  │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ WORKFLOWS│  📊 Stats-Grid (4 Kacheln)               │
│          │                                          │
│ • Run 1  │  📈 Chart: Modellqualität über Zeit      │
│ • Run 2  │                                          │
│ • Run 3  │  🧪 Experiment-Tabelle                   │
│          │                                          │
│ + Neu    │  💻 Live Terminal / 📝 Code Diff         │
│          │                                          │
├──────────┤                                          │
│ QUICK    │                                          │
│ ACTIONS  │                                          │
│          │                                          │
│ 📦 Data  │                                          │
│ ⚙️ Einst.│                                          │
│ 📊 Repor.│                                          │
└──────────┴──────────────────────────────────────────┘
```

### 4.1 Sidebar (links)

- **Workflows** — Deine Forschungsaufträge. Klick auf einen, um ihn zu öffnen.
- **+ Neuer Workflow** — Erstellt einen neuen Auftrag.
- **Workflow-Aktionen** — Hover über einen Workflow → ✏️ Bearbeiten, 📋 Duplizieren, 🗑️ Löschen.
- **Systemstatus** — Ganz unten: Zeigt ob dein System bereit ist (z.B. „System bereit — Apple M4").

### 4.2 TopBar (oben)

- **Workflow-Name** — Der Name des aktuell ausgewählten Workflows.
- **Status-Badge** — `○ BEREIT`, `● LÄUFT` (grün pulsierend), oder `✓ ABGESCHLOSSEN` (blau).
- **Target-Badge** — `🏠 LOKAL` oder `☁️ CLOUD` — zeigt wo das Training läuft.
- **▶ Start** — Startet das Training.
- **⏹ Stop** — Stoppt ein laufendes Training.
- **📤 Export** — Exportiert die Experiment-Daten als CSV.

### 4.3 Stats-Grid (4 Kacheln)

| Kachel | Was sie zeigt |
|--------|--------------|
| **Experimente** | Anzahl der durchgeführten Experimente |
| **Modellqualität** | Aktuell bester `val_bpb`-Wert (niedriger = besser) |
| **Verbesserung** | Prozentuale Verbesserung gegenüber dem Startwert |
| **Erfolgsrate** | Wie viel Prozent der Experimente behalten wurden |

### 4.4 Chart

Ein Linien-Diagramm das zeigt, wie sich die Modellqualität (val_bpb) über die Experimente hinweg verbessert. **Jeder Punkt ist ein Experiment.** Die Linie geht idealerweise nach unten — das bedeutet: das Modell wird besser.

### 4.5 Experiment-Tabelle

| Spalte | Bedeutung |
|--------|-----------|
| **#** | Experiment-Nummer |
| **Commit** | Eindeutige ID der Code-Änderung |
| **Änderung** | Was der Agent geändert hat (z.B. „n_head 6→8") |
| **val_bpb** | Qualitätswert (niedriger = besser) |
| **Memory** | Wie viel Arbeitsspeicher genutzt wurde |
| **Status** | ✅ Behalten / ❌ Übersprungen / ☠️ Fehlgeschlagen |

> **💡 Tipp:** Experimente mit 🎉 sind neue Rekorde!

### 4.6 Unterer Bereich — Terminal & Diff

Zwei Tabs:

- **💻 Live Terminal** — Echtzeit-Log des Trainings. Hier siehst du, was gerade passiert.
- **📝 Code Diff** — Zeigt die Code-Änderungen die der Agent gemacht hat (rot = entfernt, grün = hinzugefügt).

---

## 5. Deinen ersten Workflow erstellen

### Schritt 1: Neuer Workflow

Klick auf **„+ Neuer Workflow"** in der Sidebar (oder beim ersten Start wird dir der Button im Onboarding angeboten).

### Schritt 2: Konfigurieren

Das Workflow-Formular hat folgende Felder:

**Workflow Name**
> Gib deinem Experiment einen Namen. Beispiel: *„Nacht-Run: Architecture Sweep"*

**Forschungsfokus**
| Option | Bedeutung |
|--------|-----------|
| 🎯 Alles erlaubt | Der Agent darf alles ausprobieren |
| 🏗️ Architektur | Nur Modell-Struktur ändern (Schichten, Breite, etc.) |
| 🎚️ Hyperparameter | Nur Lernrate, Batch-Size etc. |
| ⚡ Optimizer | Nur den Optimizer tunen |
| 💾 Memory | Fokus auf Speicher-Optimierung |

**Strategie**
| Option | Beschreibung |
|--------|-------------|
| 🎯 Konservativ | Kleine, sichere Schritte. Weniger Risiko. |
| ⚖️ Balanced | Mix aus sicher und mutig. |
| 🚀 Aggressiv | Radikale Änderungen. Mehr Risiko, mehr Potenzial. |

**Execution Target**
| Option | Beschreibung |
|--------|-------------|
| 🏠 Lokal (Mac) | Gratis. Nutzt deinen Apple Silicon Chip. |
| ☁️ Cloud (Modal) | NVIDIA T4 GPU. ~$0.59/Stunde. Schneller, aber kostet. |

**Time Budget**
> Wie lange ein einzelnes Experiment maximal dauern darf (2, 5, 10 oder 30 Minuten).

**Custom Instructions** *(optional)*
> Freitext-Anweisungen an den Agenten, z.B. *„Fokussiere auf Modelle unter 10M Parametern"*.

### Schritt 3: Erstellen

Klick auf **„✓ Workflow erstellen"**. Der Workflow erscheint in der Sidebar.

---

## 6. Training starten & beobachten

### Starten

1. Wähle einen Workflow in der Sidebar aus.
2. Klick auf **▶ Start** in der TopBar.
3. Der Status wechselt zu **● LÄUFT** (grün).

### Was passiert jetzt?

Der AI-Agent:
1. Analysiert den aktuellen Code
2. Schlägt eine Änderung vor
3. Trainiert das Modell mit dieser Änderung
4. Misst die Qualität (`val_bpb`)
5. Entscheidet: Behalten oder Verwerfen?
6. Wiederholt alles von vorne

Du siehst den Fortschritt live:
- **Terminal** zeigt jeden Schritt in Echtzeit
- **Chart** aktualisiert sich mit jedem Experiment
- **Tabelle** füllt sich mit Ergebnissen
- **🎉 Confetti** wenn ein neuer Rekord gebrochen wird!

### Stoppen

Klick auf **⏹ Stop**. Das Training wird sauber beendet.

### Über Nacht laufen lassen

1. Erstelle einen Workflow mit 30-Minuten Time-Budget
2. Drücke **▶ Start**
3. Lass den Mac laufen (Bildschirm darf aus sein)
4. Am nächsten Morgen: Öffne `http://localhost:3000` — du siehst eine Zusammenfassung

> **⚠️ Wichtig:** Der Mac darf nicht in den Ruhezustand gehen! Gehe zu **Systemeinstellungen → Energie → Display ausschalten nach: Nie** (oder nutze die App „Amphetamine" aus dem App Store).

---

## 7. Ergebnisse verstehen

### val_bpb — Die magische Zahl

**val_bpb** steht für *Validation Bits per Byte*. Das ist die Qualitätsmetrik deines Modells.

- **Niedriger ist besser** (wie bei Golf ⛳)
- Typischer Startwert: ~1.85
- Ein guter Lauf verbessert auf ~1.45 oder darunter
- Jede Verbesserung um 0.01 ist signifikant

### Experiment-Status

| Symbol | Status | Bedeutung |
|--------|--------|-----------|
| ✅ | Behalten | Experiment war besser als das aktuelle Beste |
| ❌ | Übersprungen | War nicht besser — Änderung wird rückgängig gemacht |
| ☠️ | Fehlgeschlagen | Fehler beim Training (z.B. zu wenig Speicher) |
| 🎉 | Rekord | Neuer Bestwert! |

### Den Chart lesen

```
val_bpb
 1.85 |●
 1.80 |  ●  ●
 1.75 |        ●
 1.70 |           ●    ← Fortschritt!
 1.65 |              ●
      ├──────────────────
        1  2  3  4  5  6  ← Experiment #
```

Die Linie geht nach unten = dein Modell wird besser. 

Punkte, die *nicht* auf der Linie liegen (höher), waren verworfene Experimente.

---

## 8. Cloud-Training mit Modal

### Was ist Modal?

[Modal](https://modal.com) ist ein Cloud-Dienst für GPU-Berechnungen. Statt auf deinem Mac zu trainieren, läuft das Training auf einer **NVIDIA T4 GPU** in der Cloud — deutlich schneller als Apple Silicon für große Modelle.

### Einrichtung (einmalig)

**Schritt 1:** Modal-Account erstellen auf [modal.com](https://modal.com) (kostenlos, $5 Startguthaben).

**Schritt 2:** Modal authentifizieren. Öffne Terminal:

```bash
cd ~/ev/autosearch/engine
uv run python -m modal setup
```

Ein Browser-Tab öffnet sich. Logge dich bei Modal ein und bestätige. Das Terminal zeigt:

```
✓ Token verified successfully!
Token written to ~/.modal.toml
```

### Cloud-Training starten

1. Erstelle einen Workflow (oder bearbeite einen bestehenden)
2. Unter **Execution Target** → wähle **☁️ Cloud (Modal)**
3. Klick **▶ Start**
4. In der TopBar erscheint: **☁️ CLOUD**

### Kosten

| GPU | Kosten | Für $5 bekommst du |
|-----|--------|---------------------|
| NVIDIA T4 | ~$0.59/h | ~8 Stunden Training |

> **💡 Tipp:** Für einen schnellen Test reichen 5 Minuten — das kostet ca. $0.05.

---

## 9. Demo-Workflow & Guided Tour

Beim allerersten Start siehst du die **Onboarding-Tour**:

1. **Willkommen** — Kurze Einführung
2. **So funktioniert's** — Die 4 Schritte (Auftrag → Start → AI forscht → Ergebnisse)
3. **Probier's aus!** — Zwei Optionen:
   - **🧪 Demo starten** — Lädt 12 realistische Demo-Experimente und startet eine interaktive Tour
   - **✏️ Eigenen Workflow erstellen** — Springt direkt zum Workflow-Formular

Die **Guided Tour** zeigt dir jeden Bereich mit Spotlight-Effekt:
- 📊 Stats-Grid
- 📈 Chart
- 🧪 Experiment-Tabelle
- ▶️ Start-Button

Du kannst die Tour jederzeit **überspringen**.

> **💡 Tipp:** Die Demo-Daten werden automatisch erstellt und zeigen dir, wie ein abgeschlossener Run aussieht — ideal um sich zurechtzufinden.

---

## 10. Daten exportieren

Klick auf **📤 Export** in der TopBar.

Die App erstellt eine **CSV-Datei** mit allen Experiment-Daten:
- Experiment-Nummer
- Commit-Hash
- Beschreibung der Änderung
- val_bpb Wert
- Peak Memory
- Status (keep/discard/crash)
- Ob es ein Rekord war

Die Datei wird automatisch heruntergeladen.

---

## 11. Online, Offline & Vercel — Was geht?

### Funktioniert die App offline?

**Ja — zu 100%.** ✅

Die App läuft vollständig auf deinem Mac. So funktioniert's:

| Komponente | Läuft wo | Braucht Internet? |
|-----------|----------|-------------------|
| Dashboard (Browser-UI) | Dein Mac | ❌ Nein |
| Datenbank (SQLite) | Dein Mac | ❌ Nein |
| Training (MLX Engine) | Dein Mac | ❌ Nein* |
| Training (Modal Cloud) | Cloud-Server | ✅ Ja |

> *Beim **allerersten** Training werden Trainingsdaten von HuggingFace heruntergeladen (ca. 200 MB). Danach läuft alles offline.

**Zusammengefasst:**
- ✅ Dashboard öffnen und bedienen → offline
- ✅ Lokales Training starten → offline (nach erstem Daten-Download)
- ✅ Ergebnisse anschauen, Workflows erstellen → offline
- ✅ Daten exportieren → offline
- ❌ Cloud-Training (Modal) → braucht Internet
- ❌ Erster Daten-Download → braucht Internet

### Kann ich die App auf Vercel deployen?

**Nein — nicht direkt.** ❌

Hier ist warum, ganz ehrlich erklärt:

| Problem | Warum es nicht geht |
|---------|---------------------|
| **SQLite-Datenbank** | Vercel hat kein persistentes Dateisystem. Die Datenbank würde bei jedem Request verschwinden. |
| **Python-Engine** | Die App startet Python-Prozesse als Subprozess. Vercel erlaubt keine langlebigen Prozesse. |
| **Training** | Ein Training dauert Minuten bis Stunden. Vercel hat ein 30-Sekunden-Timeout. |
| **PID-Dateien** | Die App nutzt `/tmp`-Dateien um laufende Prozesse zu tracken. Auf Vercel gibt es kein `/tmp`. |

### Alternativen für Remote-Zugriff

Wenn du die App von **einem anderen Gerät** aus nutzen möchtest:

**Option 1: Lokales Netzwerk (empfohlen)**
```bash
# Starte die App so, dass sie im Netzwerk erreichbar ist:
cd ~/ev/autosearch/app
npm run dev -- --hostname 0.0.0.0
```
Dann öffne von einem anderen Gerät im selben WLAN:
```
http://DEIN-MAC-IP:3000
```
(Finde deine IP: **Systemeinstellungen → WLAN → Details → IP-Adresse**)

**Option 2: Tailscale / ngrok (überall)**
Mit Tools wie [Tailscale](https://tailscale.com) oder [ngrok](https://ngrok.com) kannst du deinen Mac von überall erreichen — auch unterwegs.

**Option 3: Eigener Server**
Die App kann auf jedem Linux-Server mit Node.js + Python laufen. Empfohlen: Ein kleiner VPS (z.B. Hetzner, ~€5/Monat) als „immer an"-Maschine.

---

## 12. Fehlerbehebung

### Die App startet nicht

**Problem:** `npm run dev` zeigt einen Fehler.

**Lösung:**
```bash
cd ~/ev/autosearch/app
rm -rf node_modules
npm install
npm run dev
```

### „Port 3000 ist belegt"

**Problem:** `Error: Port 3000 is already in use`

**Lösung:**
```bash
# Finde den Prozess der Port 3000 belegt:
lsof -i :3000
# Beende ihn (ersetze PID mit der Nummer aus der Ausgabe):
kill -9 PID
```

Oder starte auf einem anderen Port:
```bash
npm run dev -- --port 3001
```

### Training startet nicht

**Checkliste:**
1. ✅ Ist ein Workflow ausgewählt? (nicht nur erstellt, sondern in der Sidebar angeklickt)
2. ✅ Zeigt der Status „○ BEREIT"? (Nicht schon „● LÄUFT")
3. ✅ Terminal im Hintergrund noch offen? (wo `npm run dev` läuft)
4. ✅ Engine installiert? (`cd engine && uv sync`)

### Cloud-Training funktioniert nicht

**Checkliste:**
1. ✅ Modal authentifiziert? → `cd engine && uv run python -m modal setup`
2. ✅ Internet-Verbindung?
3. ✅ Credits vorhanden? → Prüfe auf [modal.com/billing](https://modal.com/billing)

### Datenbank zurücksetzen

Wenn etwas komplett schiefgeht und du von vorne starten willst:

```bash
cd ~/ev/autosearch/app
rm -rf data/autoresearch.db
npm run dev
```

Die Datenbank wird beim nächsten Start automatisch neu erstellt.

---

## 13. Tastenkürzel

| Kürzel | Aktion |
|--------|--------|
| `Escape` | Modal / Dialog schließen |
| `Enter` | Im Workflow-Formular: bestätigen |
| `Tab` | Zwischen Elementen navigieren |
| `Leertaste` | Radio-Option auswählen (im Formular) |

---

## 14. Glossar

| Begriff | Erklärung |
|---------|-----------|
| **val_bpb** | *Validation Bits per Byte.* Qualitätsmetrik. Niedriger = besser. |
| **Workflow** | Ein Forschungsauftrag mit bestimmten Einstellungen. |
| **Experiment** | Ein einzelner Trainings-Durchlauf mit einer bestimmten Konfiguration. |
| **MLX** | Apples Machine-Learning-Framework, optimiert für Apple Silicon. |
| **Modal** | Cloud-Dienst für GPU-Berechnungen (optional). |
| **GPT** | *Generative Pre-trained Transformer.* Die Art von KI-Modell die trainiert wird. |
| **Epoch** | Ein kompletter Durchlauf durch alle Trainingsdaten. |
| **Optimizer** | Der Algorithmus der bestimmt, wie das Modell lernt (z.B. AdamW). |
| **Hyperparameter** | Einstellungen die beeinflussen, wie das Training abläuft (Lernrate, Batch-Size, etc.). |
| **Baseline** | Der Ausgangswert, mit dem alle Verbesserungen verglichen werden. |
| **NVIDIA T4** | GPU-Typ in der Cloud. Gute Balance zwischen Preis und Leistung. |
| **SQLite** | Die lokale Datenbank in der alle Experiment-Daten gespeichert werden. |

---

> **Noch Fragen?** Die App ist Open Source. Schau dir den Code an unter `~/ev/autosearch/` — oder frag einfach deinen AI-Assistenten.

---

*Designed with ❤️ for researchers who'd rather sleep than babysit training runs.*
