import { dbRun } from './db/database';
import { v4 as uuidv4 } from 'uuid';

export type LogLevel = 'info' | 'warn' | 'error' | 'audit';
export type ActorType = 'AI_AGENT' | 'HUMAN_USER' | 'SYSTEM';

export interface AuditLogEntry {
  id: string;
  assessment_id?: string;
  action_type: string;
  actor: ActorType;
  details_json: string;
  created_at?: string;
}

export class StructuredLogger {
  static async log(level: LogLevel, message: string, meta: Record<string, any> = {}) {
    const timestamp = new Date().toISOString();
    const logPayload = {
      timestamp,
      level,
      message,
      ...meta,
    };
    console.log(JSON.stringify(logPayload));
  }

  static async audit(
    action_type: string,
    actor: ActorType,
    details: Record<string, any>,
    assessment_id?: string
  ): Promise<AuditLogEntry> {
    const id = uuidv4();
    const details_json = JSON.stringify(details);
    const timestamp = new Date().toISOString();

    try {
      await dbRun(
        `INSERT INTO audit_logs (id, assessment_id, action_type, actor, details_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, assessment_id || null, action_type, actor, details_json, timestamp]
      );
    } catch (err) {
      console.error('Failed to write audit log to DB:', err);
    }

    this.log('audit', `[AUDIT] ${action_type} by ${actor}`, {
      id,
      assessment_id,
      actor,
      details,
    });

    return {
      id,
      assessment_id,
      action_type,
      actor,
      details_json,
      created_at: timestamp,
    };
  }
}
