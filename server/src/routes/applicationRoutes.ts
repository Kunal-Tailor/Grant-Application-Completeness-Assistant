import { Router, Request, Response } from 'express';
import { dbGet, dbAll, dbRun } from '../db/database';
import { VersionService } from '../services/versionService';
import { v4 as uuidv4 } from 'uuid';

export const applicationRouter = Router();

// List applications
applicationRouter.get('/', async (req: Request, res: Response) => {
  try {
    const applications = await dbAll<any>(
      `SELECT id, guideline_id, title, applicant_name, version, hash, created_at, updated_at
       FROM applications ORDER BY updated_at DESC`
    );
    res.json({ success: true, applications });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get application by ID
applicationRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const application = await dbGet<any>(`SELECT * FROM applications WHERE id = ?`, [id]);
    if (!application) return res.status(404).json({ success: false, error: 'Application not found' });

    const versions = await dbAll<any>(
      `SELECT version, hash, change_summary, created_at FROM application_versions WHERE application_id = ? ORDER BY version DESC`,
      [id]
    );

    const supportingDocs = await dbAll<any>(
      `SELECT * FROM supporting_documents WHERE application_id = ? ORDER BY created_at ASC`,
      [id]
    );

    res.json({ success: true, application, versions, supportingDocs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update application content (bumps version & marks assessments as stale)
applicationRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, applicant_name, content, changeSummary } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Application content is required.' });
    }

    if (title || applicant_name) {
      await dbRun(
        `UPDATE applications SET title = COALESCE(?, title), applicant_name = COALESCE(?, applicant_name) WHERE id = ?`,
        [title, applicant_name, id]
      );
    }

    const versionResult = await VersionService.recordApplicationVersion(
      id,
      content,
      changeSummary || 'Application draft revised by user'
    );

    res.json({
      success: true,
      message: versionResult.updated
        ? `Application updated to version ${versionResult.version}. Assessments marked stale.`
        : 'No content changes detected.',
      version: versionResult.version,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new application
applicationRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { guideline_id, title, applicant_name, content } = req.body;
    if (!guideline_id || !title || !content) {
      return res.status(400).json({ success: false, error: 'Guideline ID, title, and content are required.' });
    }

    const id = uuidv4();
    const hash = VersionService.generateHash(content);

    await dbRun(
      `INSERT INTO applications (id, guideline_id, title, applicant_name, content, version, hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, guideline_id, title, applicant_name || 'Anonymous Applicant', content, hash]
    );

    res.json({ success: true, id, message: 'Application created successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
