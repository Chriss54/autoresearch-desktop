/**
 * AutoResearch Command Center — SQLite Database Layer
 * Uses better-sqlite3 for synchronous, reliable local storage.
 */

const Database = require("better-sqlite3");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const DB_PATH = path.join(process.cwd(), "data", "autoresearch.db");

let _db = null;

function getDb() {
  if (_db) return _db;

  // Ensure data directory exists
  const fs = require("fs");
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  // Create tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS workflows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      focus TEXT NOT NULL DEFAULT 'all',
      strategy TEXT NOT NULL DEFAULT 'conservative',
      target TEXT NOT NULL DEFAULT 'local',
      timeBudget INTEGER NOT NULL DEFAULT 5,
      instructions TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'idle',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS experiments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workflowId TEXT NOT NULL,
      commitHash TEXT DEFAULT '',
      change TEXT DEFAULT '',
      valBpb REAL DEFAULT 0,
      peakMemory REAL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'running',
      isRecord INTEGER NOT NULL DEFAULT 0,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (workflowId) REFERENCES workflows(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workflowId TEXT NOT NULL,
      text TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (workflowId) REFERENCES workflows(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS diffs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workflowId TEXT NOT NULL,
      experimentId INTEGER,
      type TEXT NOT NULL DEFAULT 'context',
      text TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (workflowId) REFERENCES workflows(id) ON DELETE CASCADE
    );
  `);

  return _db;
}

// ---- Workflow CRUD ----

function getWorkflows() {
  const db = getDb();
  const workflows = db.prepare(`
    SELECT w.*, COUNT(e.id) as experiments
    FROM workflows w
    LEFT JOIN experiments e ON e.workflowId = w.id
    GROUP BY w.id
    ORDER BY w.createdAt DESC
  `).all();
  return workflows;
}

function getWorkflow(id) {
  const db = getDb();
  const workflow = db.prepare(`
    SELECT w.*, COUNT(e.id) as experiments
    FROM workflows w
    LEFT JOIN experiments e ON e.workflowId = w.id
    WHERE w.id = ?
    GROUP BY w.id
  `).get(id);
  return workflow || null;
}

function createWorkflow({ name, focus, strategy, target, timeBudget, instructions }) {
  const db = getDb();
  const id = `wf-${uuidv4().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO workflows (id, name, focus, strategy, target, timeBudget, instructions, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'idle')
  `).run(id, name, focus || "all", strategy || "conservative", target || "local", timeBudget || 5, instructions || "");
  return getWorkflow(id);
}

function updateWorkflowStatus(id, status) {
  const db = getDb();
  db.prepare("UPDATE workflows SET status = ? WHERE id = ?").run(status, id);
  return getWorkflow(id);
}

function updateWorkflow({ id, name, focus, strategy, target, timeBudget, instructions, status }) {
  const db = getDb();
  if (status && !name) {
    // Status-only update (backward compat)
    return updateWorkflowStatus(id, status);
  }
  db.prepare(`
    UPDATE workflows SET name = ?, focus = ?, strategy = ?, target = ?, timeBudget = ?, instructions = ?
    WHERE id = ?
  `).run(name, focus || 'all', strategy || 'conservative', target || 'local', timeBudget || 5, instructions || '', id);
  return getWorkflow(id);
}

function deleteWorkflow(id) {
  const db = getDb();
  db.prepare("DELETE FROM workflows WHERE id = ?").run(id);
}

// ---- Experiment CRUD ----

function getExperiments(workflowId) {
  const db = getDb();
  return db.prepare(
    "SELECT * FROM experiments WHERE workflowId = ? ORDER BY id ASC"
  ).all(workflowId);
}

function createExperiment({ workflowId, commitHash, change, valBpb, peakMemory, status, isRecord }) {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO experiments (workflowId, commitHash, change, valBpb, peakMemory, status, isRecord, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(workflowId, commitHash || "", change || "", valBpb || 0, peakMemory || 0, status || "running", isRecord ? 1 : 0, Date.now());
  return db.prepare("SELECT * FROM experiments WHERE id = ?").get(result.lastInsertRowid);
}

// ---- Logs ----

function getLogs(workflowId) {
  const db = getDb();
  return db.prepare(
    "SELECT * FROM logs WHERE workflowId = ? ORDER BY id ASC"
  ).all(workflowId);
}

function addLog({ workflowId, text, type }) {
  const db = getDb();
  db.prepare(
    "INSERT INTO logs (workflowId, text, type, timestamp) VALUES (?, ?, ?, ?)"
  ).run(workflowId, text, type || "info", Date.now());
}

// ---- Diffs ----

function getDiffs(workflowId) {
  const db = getDb();
  return db.prepare(
    "SELECT * FROM diffs WHERE workflowId = ? ORDER BY id ASC"
  ).all(workflowId);
}

function setDiffs(workflowId, diffs) {
  const db = getDb();
  const del = db.prepare("DELETE FROM diffs WHERE workflowId = ?");
  const ins = db.prepare("INSERT INTO diffs (workflowId, type, text) VALUES (?, ?, ?)");
  const transaction = db.transaction(() => {
    del.run(workflowId);
    for (const d of diffs) {
      ins.run(workflowId, d.type, d.text);
    }
  });
  transaction();
}

// ---- Seed Demo Data ----

function seedDemoData() {
  const db = getDb();
  const existing = db.prepare("SELECT COUNT(*) as count FROM workflows").get();
  if (existing.count > 0) return false; // Already seeded

  const demoWorkflows = [
    { id: "wf-1", name: "Nacht-Run: Konservativ", status: "completed", focus: "architecture", strategy: "conservative", target: "local", timeBudget: 5 },
    { id: "wf-2", name: "Moonshot: Radikal", status: "idle", focus: "all", strategy: "aggressive", target: "cloud", timeBudget: 5 },
    { id: "wf-3", name: "Hyperparameter Sweep", status: "idle", focus: "hyperparameters", strategy: "conservative", target: "local", timeBudget: 5 },
  ];

  const demoExperiments = [
    { id: 1, commit: "a1b2c3d", change: "Baseline (original train.py)", valBpb: 1.8529, peakMemory: 8.2, status: "keep", isRecord: false },
    { id: 2, commit: "b2c3d4e", change: "Reduce DEPTH from 4 to 3", valBpb: 1.8891, peakMemory: 6.1, status: "discard", isRecord: false },
    { id: 3, commit: "c3d4e5f", change: "Lower TOTAL_BATCH_SIZE to 2^15", valBpb: 1.8302, peakMemory: 7.8, status: "keep", isRecord: true },
    { id: 4, commit: "d4e5f6g", change: "Increase LR to 0.06", valBpb: 1.8445, peakMemory: 8.2, status: "discard", isRecord: false },
    { id: 5, commit: "e5f6g7h", change: "Switch to WINDOW_PATTERN='L'", valBpb: 1.8105, peakMemory: 8.4, status: "keep", isRecord: true },
    { id: 6, commit: "f6g7h8i", change: "Double model width (OOM)", valBpb: 0, peakMemory: 0, status: "crash", isRecord: false },
    { id: 7, commit: "g7h8i9j", change: "Add weight decay 0.3", valBpb: 1.8201, peakMemory: 8.2, status: "discard", isRecord: false },
    { id: 8, commit: "h8i9j0k", change: "Reduce HEAD_DIM to 64", valBpb: 1.8077, peakMemory: 7.9, status: "keep", isRecord: true },
    { id: 9, commit: "i9j0k1l", change: "Increase EMBEDDING_LR to 0.8", valBpb: 1.8155, peakMemory: 7.9, status: "discard", isRecord: false },
    { id: 10, commit: "j0k1l2m", change: "ASPECT_RATIO 48, DEPTH 6", valBpb: 1.7944, peakMemory: 7.1, status: "keep", isRecord: true },
    { id: 11, commit: "k1l2m3n", change: "Remove value embeddings", valBpb: 1.8312, peakMemory: 6.5, status: "discard", isRecord: false },
    { id: 12, commit: "l2m3n4o", change: "Warmup ratio 0.05 + warmdown 0.6", valBpb: 1.7891, peakMemory: 7.1, status: "keep", isRecord: true },
  ];

  const demoLogs = [
    { text: "🚀 Experiment Loop gestartet — Workflow: Nacht-Run: Konservativ", type: "info" },
    { text: "[Exp #1] Baseline — val_bpb: 1.852900, peak_mem: 8.2GB — KEEP ✅", type: "success" },
    { text: "[Exp #2] Reduce DEPTH from 4 to 3 — val_bpb: 1.889100 — DISCARD ❌", type: "warning" },
    { text: "[Exp #3] Lower TOTAL_BATCH_SIZE to 2^15 — val_bpb: 1.830200 — KEEP ✅ 🎉 New Record!", type: "success" },
    { text: "[Exp #4] Increase LR to 0.06 — val_bpb: 1.844500 — DISCARD ❌", type: "warning" },
    { text: "[Exp #5] Switch to WINDOW_PATTERN='L' — val_bpb: 1.810500 — KEEP ✅ 🎉 New Record!", type: "success" },
    { text: "[Exp #6] Double model width — CRASH: RuntimeError: MPS backend out of memory ☠️", type: "error" },
    { text: "[Exp #7] Add weight decay 0.3 — val_bpb: 1.820100 — DISCARD ❌", type: "warning" },
    { text: "[Exp #8] Reduce HEAD_DIM to 64 — val_bpb: 1.807700 — KEEP ✅ 🎉 New Record!", type: "success" },
    { text: "[Exp #9] Increase EMBEDDING_LR to 0.8 — val_bpb: 1.815500 — DISCARD ❌", type: "warning" },
    { text: "[Exp #10] ASPECT_RATIO 48, DEPTH 6 — val_bpb: 1.794400 — KEEP ✅ 🎉 New Record!", type: "success" },
    { text: "[Exp #11] Remove value embeddings — val_bpb: 1.831200 — DISCARD ❌", type: "warning" },
    { text: "[Exp #12] Warmup ratio 0.05 + warmdown 0.6 — val_bpb: 1.789100 — KEEP ✅ 🎉 New Record!", type: "success" },
    { text: "─────────────────────────────────────────", type: "info" },
    { text: "📊 Run beendet. 12 Experimente, Beste val_bpb: 1.789100 (Δ -0.0638)", type: "info" },
  ];

  const demoDiffs = [
    { type: "context", text: "# Model architecture" },
    { type: "removed", text: "ASPECT_RATIO = 64" },
    { type: "added", text: "ASPECT_RATIO = 48" },
    { type: "context", text: "HEAD_DIM = 128" },
    { type: "removed", text: 'WINDOW_PATTERN = "SSSL"' },
    { type: "added", text: 'WINDOW_PATTERN = "L"' },
    { type: "context", text: "" },
    { type: "context", text: "# Model size" },
    { type: "removed", text: "DEPTH = 4" },
    { type: "added", text: "DEPTH = 6" },
    { type: "context", text: "DEVICE_BATCH_SIZE = 16" },
    { type: "context", text: "" },
    { type: "context", text: "# Optimization" },
    { type: "removed", text: "WARMUP_RATIO = 0.0" },
    { type: "added", text: "WARMUP_RATIO = 0.05" },
    { type: "removed", text: "WARMDOWN_RATIO = 0.5" },
    { type: "added", text: "WARMDOWN_RATIO = 0.6" },
  ];

  const transaction = db.transaction(() => {
    const insW = db.prepare("INSERT INTO workflows (id, name, focus, strategy, target, timeBudget, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    for (const w of demoWorkflows) {
      insW.run(w.id, w.name, w.focus, w.strategy, w.target, w.timeBudget, w.status);
    }

    const insE = db.prepare("INSERT INTO experiments (workflowId, commitHash, change, valBpb, peakMemory, status, isRecord, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    const now = Date.now();
    for (let i = 0; i < demoExperiments.length; i++) {
      const e = demoExperiments[i];
      insE.run("wf-1", e.commit, e.change, e.valBpb, e.peakMemory, e.status, e.isRecord ? 1 : 0, now - (3600000 * (10 - i * 0.1)));
    }

    const insL = db.prepare("INSERT INTO logs (workflowId, text, type, timestamp) VALUES (?, ?, ?, ?)");
    for (let i = 0; i < demoLogs.length; i++) {
      insL.run("wf-1", demoLogs[i].text, demoLogs[i].type, now - (3600000 * 10) + (i * 60000));
    }

    const insD = db.prepare("INSERT INTO diffs (workflowId, type, text) VALUES (?, ?, ?)");
    for (const d of demoDiffs) {
      insD.run("wf-1", d.type, d.text);
    }
  });

  transaction();
  return true;
}

module.exports = {
  getDb,
  getWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  updateWorkflowStatus,
  deleteWorkflow,
  getExperiments,
  createExperiment,
  getLogs,
  addLog,
  getDiffs,
  setDiffs,
  seedDemoData,
};
