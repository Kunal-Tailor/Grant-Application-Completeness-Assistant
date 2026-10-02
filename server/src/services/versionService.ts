import crypto from 'crypto';
import { dbGet, dbRun, dbAll } from '../db/database';
import { StructuredLogger } from '../logger';
import { v4 as uuidv4 } from 'uuid';

export class VersionService {
  /**
   * Generates a deterministic SHA-256 hash of text content.
   */
  static generateHash(content: string): string {
    return crypto.createHash('sha256').update(content.trim()).digest('hex');
  }

  /**
   * Checks whether the current assessment is stale compared to latest guideline and application versions.
   */
  static async checkStaleness(assessmentId: string): Promise<{
    isStale: boolean;
    reason?: string;
    currentAppHash?: string;
    analyzedAppHash?: string;
    currentGuidelineHash?: string;
    analyzedGuidelineHash?: string;
  }> {
    const assessment = await dbGet<any>(
      `SELECT * FROM assessments WHERE id = ?`,
      [assessmentId]
    );

    if (!assessment) {
      throw new Error(`Assessment ${assessmentId} not found.`);
    }

    const application = await dbGet<any>(
      `SELECT * FROM applications WHERE id = ?`,
      [assessment.application_id]
    );

    const guideline = await dbGet<any>(
      `SELECT * FROM guidelines WHERE id = ?`,
      [assessment.guideline_id]
    );

    if (!application || !guideline) {
      return { isStale: true, reason: 'Associated application or guideline no longer exists' };
    }

    const currentAppHash = this.generateHash(application.content);
    const currentGuidelineHash = this.generateHash(guideline.content);

    const isAppChanged = currentAppHash !== assessment.app_hash_analyzed;
    const isGuidelineChanged = currentGuidelineHash !== assessment.guideline_hash_analyzed;

    const isStale = isAppChanged || isGuidelineChanged || assessment.is_stale === 1;

    let reason: string | undefined;
    if (isAppChanged && isGuidelineChanged) {
      reason = 'Both draft application and grant guideline documents have been modified since last analysis.';
    } else if (isAppChanged) {
      reason = 'Draft application content was updated since last assessment (v' + assessment.app_version_analyzed + ' -> v' + application.version + ').';
    } else if (isGuidelineChanged) {
      reason = 'Grant guideline document was modified since last assessment (v' + assessment.guideline_version_analyzed + ' -> v' + guideline.version + ').';
    }

    if (isStale && assessment.is_stale === 0) {
      // Update assessment record to stale
      await dbRun(`UPDATE assessments SET is_stale = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [assessmentId]);
      await StructuredLogger.audit(
        'STALENESS_TRIGGERED',
        'SYSTEM',
        { assessmentId, reason, currentAppHash, currentGuidelineHash },
        assessmentId
      );
    }

    return {
      isStale,
      reason,
      currentAppHash,
      analyzedAppHash: assessment.app_hash_analyzed,
      currentGuidelineHash,
      analyzedGuidelineHash: assessment.guideline_hash_analyzed,
    };
  }

  /**
   * Records a new version snapshot for an application if content changed.
   */
  static async recordApplicationVersion(
    applicationId: string,
    newContent: string,
    changeSummary: string = 'User edit'
  ): Promise<{ updated: boolean; version: number; hash: string }> {
    const app = await dbGet<any>(`SELECT * FROM applications WHERE id = ?`, [applicationId]);
    if (!app) throw new Error('Application not found');

    const newHash = this.generateHash(newContent);
    if (newHash === app.hash) {
      return { updated: false, version: app.version, hash: app.hash };
    }

    const newVersion = app.version + 1;

    // Snapshot old version into history
    await dbRun(
      `INSERT INTO application_versions (id, application_id, version, content, hash, change_summary)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), applicationId, app.version, app.content, app.hash, changeSummary]
    );

    // Update main application
    await dbRun(
      `UPDATE applications SET content = ?, version = ?, hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newContent, newVersion, newHash, applicationId]
    );

    // Flag associated assessments as stale
    await dbRun(
      `UPDATE assessments SET is_stale = 1, updated_at = CURRENT_TIMESTAMP WHERE application_id = ?`,
      [applicationId]
    );

    await StructuredLogger.audit(
      'APPLICATION_VERSION_BUMPED',
      'HUMAN_USER',
      { applicationId, oldVersion: app.version, newVersion, changeSummary },
      undefined
    );

    return { updated: true, version: newVersion, hash: newHash };
  }

  /**
   * Records a new version snapshot for a guideline if content changed.
   */
  static async recordGuidelineVersion(
    guidelineId: string,
    newContent: string,
    changeSummary: string = 'Guideline update'
  ): Promise<{ updated: boolean; version: number; hash: string }> {
    const guide = await dbGet<any>(`SELECT * FROM guidelines WHERE id = ?`, [guidelineId]);
    if (!guide) throw new Error('Guideline not found');

    const newHash = this.generateHash(newContent);
    if (newHash === guide.hash) {
      return { updated: false, version: guide.version, hash: guide.hash };
    }

    const newVersion = guide.version + 1;

    // Snapshot old version into history
    await dbRun(
      `INSERT INTO guideline_versions (id, guideline_id, version, content, hash, change_summary)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), guidelineId, guide.version, guide.content, guide.hash, changeSummary]
    );

    // Update main guideline
    await dbRun(
      `UPDATE guidelines SET content = ?, version = ?, hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newContent, newVersion, newHash, guidelineId]
    );

    // Flag associated assessments as stale
    await dbRun(
      `UPDATE assessments SET is_stale = 1, updated_at = CURRENT_TIMESTAMP WHERE guideline_id = ?`,
      [guidelineId]
    );

    await StructuredLogger.audit(
      'GUIDELINE_VERSION_BUMPED',
      'HUMAN_USER',
      { guidelineId, oldVersion: guide.version, newVersion, changeSummary },
      undefined
    );

    return { updated: true, version: newVersion, hash: newHash };
  }
}
