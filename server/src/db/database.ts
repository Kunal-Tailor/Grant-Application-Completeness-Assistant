import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(__dirname, '../../grant_assistant.sqlite');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open SQLite database:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper for promise-based queries
export function dbRun(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function dbGet<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T);
    });
  });
}

export function dbAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve((rows || []) as T[]);
    });
  });
}

export async function initializeDatabase() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS guidelines (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS guideline_versions (
      id TEXT PRIMARY KEY,
      guideline_id TEXT NOT NULL,
      version INTEGER NOT NULL,
      content TEXT NOT NULL,
      hash TEXT NOT NULL,
      change_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (guideline_id) REFERENCES guidelines(id) ON DELETE CASCADE
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      guideline_id TEXT NOT NULL,
      title TEXT NOT NULL,
      applicant_name TEXT,
      content TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (guideline_id) REFERENCES guidelines(id) ON DELETE CASCADE
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS application_versions (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      version INTEGER NOT NULL,
      content TEXT NOT NULL,
      hash TEXT NOT NULL,
      change_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS supporting_documents (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      name TEXT NOT NULL,
      doc_type TEXT NOT NULL,
      description TEXT,
      file_path TEXT,
      file_size INTEGER,
      verified_tag TEXT,
      is_mandatory INTEGER DEFAULT 1,
      is_attached INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      guideline_id TEXT NOT NULL,
      app_version_analyzed INTEGER NOT NULL,
      guideline_version_analyzed INTEGER NOT NULL,
      app_hash_analyzed TEXT NOT NULL,
      guideline_hash_analyzed TEXT NOT NULL,
      is_stale INTEGER NOT NULL DEFAULT 0,
      deterministic_score REAL NOT NULL DEFAULT 0,
      mandatory_score REAL NOT NULL DEFAULT 0,
      recommended_score REAL NOT NULL DEFAULT 0,
      total_requirements INTEGER NOT NULL DEFAULT 0,
      mandatory_count INTEGER NOT NULL DEFAULT 0,
      mandatory_fulfilled INTEGER NOT NULL DEFAULT 0,
      recommended_count INTEGER NOT NULL DEFAULT 0,
      recommended_fulfilled INTEGER NOT NULL DEFAULT 0,
      missing_docs_count INTEGER NOT NULL DEFAULT 0,
      unsubstantiated_claims_count INTEGER NOT NULL DEFAULT 0,
      summary_markdown TEXT,
      legal_disclaimer_acknowledged INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
      FOREIGN KEY (guideline_id) REFERENCES guidelines(id) ON DELETE CASCADE
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS requirements (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      req_code TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      is_mandatory INTEGER NOT NULL DEFAULT 1,
      guideline_citation TEXT NOT NULL, -- JSON
      mapping_status TEXT NOT NULL, -- 'fulfilled', 'partially_fulfilled', 'missing', 'ambiguous'
      evidence_strength TEXT NOT NULL, -- 'strong', 'moderate', 'weak', 'none'
      human_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'corrected', 'rejected'
      human_notes TEXT,
      application_citation TEXT, -- JSON
      missing_elements TEXT, -- JSON array
      clarification_question TEXT,
      confidence_score REAL DEFAULT 0.85,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS unsubstantiated_claims (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      claim_text TEXT NOT NULL,
      section TEXT,
      severity TEXT NOT NULL, -- 'high', 'medium', 'low'
      explanation TEXT NOT NULL,
      recommended_evidence TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'flagged', -- 'flagged', 'resolved', 'dismissed'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS clarification_questions (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      requirement_id TEXT,
      question TEXT NOT NULL,
      priority TEXT NOT NULL, -- 'critical', 'high', 'medium'
      context_hint TEXT,
      applicant_response TEXT,
      status TEXT NOT NULL DEFAULT 'open', -- 'open', 'resolved'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      assessment_id TEXT,
      action_type TEXT NOT NULL,
      actor TEXT NOT NULL, -- 'AI_AGENT', 'HUMAN_USER', 'SYSTEM'
      details_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Database tables verified and initialized successfully.');
}
