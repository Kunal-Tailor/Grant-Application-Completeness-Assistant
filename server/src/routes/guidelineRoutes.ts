import { Router, Request, Response } from 'express';
import { dbGet, dbAll, dbRun } from '../db/database';
import { VersionService } from '../services/versionService';
import { v4 as uuidv4 } from 'uuid';

export const guidelineRouter = Router();

// List all guidelines
guidelineRouter.get('/', async (req: Request, res: Response) => {
  try {
    const guidelines = await dbAll<any>(`SELECT id, title, version, hash, created_at, updated_at FROM guidelines ORDER BY updated_at DESC`);
    res.json({ success: true, guidelines });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get guideline by ID
guidelineRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const guideline = await dbGet<any>(`SELECT * FROM guidelines WHERE id = ?`, [id]);
    if (!guideline) return res.status(404).json({ success: false, error: 'Guideline not found' });

    const versions = await dbAll<any>(
      `SELECT version, hash, change_summary, created_at FROM guideline_versions WHERE guideline_id = ? ORDER BY version DESC`,
      [id]
    );

    res.json({ success: true, guideline, versions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update guideline content (bumps version & marks assessments as stale)
guidelineRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, changeSummary } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Guideline content is required.' });
    }

    if (title) {
      await dbRun(`UPDATE guidelines SET title = ? WHERE id = ?`, [title, id]);
    }

    const versionResult = await VersionService.recordGuidelineVersion(
      id,
      content,
      changeSummary || 'Guideline text updated by user'
    );

    res.json({
      success: true,
      message: versionResult.updated
        ? `Guideline updated to version ${versionResult.version}. Assessments marked stale.`
        : 'No content changes detected.',
      version: versionResult.version,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create a new guideline
guidelineRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required.' });
    }

    const id = uuidv4();
    const hash = VersionService.generateHash(content);

    await dbRun(
      `INSERT INTO guidelines (id, title, content, version, hash, created_at, updated_at)
       VALUES (?, ?, ?, 1, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, title, content, hash]
    );

    res.json({ success: true, id, message: 'Guideline created successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
