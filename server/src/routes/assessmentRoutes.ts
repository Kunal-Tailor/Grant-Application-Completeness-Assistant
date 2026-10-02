import { Router, Request, Response } from 'express';
import { dbGet, dbAll, dbRun } from '../db/database';
import { AIService } from '../services/aiService';
import { ScoringService } from '../services/scoringService';
import { VersionService } from '../services/versionService';
import { StructuredLogger } from '../logger';
import { SAMPLE_SCENARIOS, loadSampleScenario } from '../services/sampleData';
import { v4 as uuidv4 } from 'uuid';

export const assessmentRouter = Router();

// Get list of pre-configured sample scenarios
assessmentRouter.get('/scenarios', async (req: Request, res: Response) => {
  try {
    const list = SAMPLE_SCENARIOS.map((s) => ({
      id: s.id,
      name: s.name,
      tagline: s.tagline,
      category: s.category,
      guidelineTitle: s.guideline.title,
      applicationTitle: s.application.title,
      docsCount: s.supporting_docs.length,
    }));
    res.json({ success: true, scenarios: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Load a specific sample scenario
assessmentRouter.post('/scenarios/load/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assessmentId = await loadSampleScenario(id);
    res.json({ success: true, assessmentId, message: `Loaded scenario ${id} successfully.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get complete assessment detail
assessmentRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assessment = await dbGet<any>(`SELECT * FROM assessments WHERE id = ?`, [id]);
    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    const application = await dbGet<any>(`SELECT * FROM applications WHERE id = ?`, [assessment.application_id]);
    const guideline = await dbGet<any>(`SELECT * FROM guidelines WHERE id = ?`, [assessment.guideline_id]);
    const supportingDocs = await dbAll<any>(`SELECT * FROM supporting_documents WHERE application_id = ? ORDER BY created_at ASC`, [assessment.application_id]);
    
    // Parse requirement JSON citations
    const rawRequirements = await dbAll<any>(`SELECT * FROM requirements WHERE assessment_id = ? ORDER BY req_code ASC`, [id]);
    const requirements = rawRequirements.map((r) => ({
      ...r,
      is_mandatory: r.is_mandatory === 1,
      guideline_citation: r.guideline_citation ? JSON.parse(r.guideline_citation) : {},
      application_citation: r.application_citation ? JSON.parse(r.application_citation) : {},
      missing_elements: r.missing_elements ? JSON.parse(r.missing_elements) : [],
    }));

    const unsubstantiatedClaims = await dbAll<any>(`SELECT * FROM unsubstantiated_claims WHERE assessment_id = ? ORDER BY created_at ASC`, [id]);
    const clarificationQuestions = await dbAll<any>(`SELECT * FROM clarification_questions WHERE assessment_id = ? ORDER BY created_at ASC`, [id]);

    // Check live staleness against current document hashes
    const stalenessInfo = await VersionService.checkStaleness(id);

    // Calculate live score representation
    const scoreResult = ScoringService.calculateScore(
      requirements,
      supportingDocs,
      unsubstantiatedClaims
    );

    res.json({
      success: true,
      assessment: {
        ...assessment,
        is_stale: stalenessInfo.isStale ? 1 : 0,
        staleness_reason: stalenessInfo.reason,
        scoring_details: scoreResult,
      },
      application,
      guideline,
      supportingDocs,
      requirements,
      unsubstantiatedClaims,
      clarificationQuestions,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Run AI Assessment on draft application against guideline
assessmentRouter.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { applicationId, guidelineId, apiKey, provider } = req.body;

    const application = await dbGet<any>(`SELECT * FROM applications WHERE id = ?`, [applicationId]);
    const guideline = await dbGet<any>(`SELECT * FROM guidelines WHERE id = ?`, [guidelineId]);

    if (!application || !guideline) {
      return res.status(400).json({ success: false, error: 'Application and Guideline must both exist.' });
    }

    const supportingDocs = await dbAll<any>(
      `SELECT * FROM supporting_documents WHERE application_id = ?`,
      [applicationId]
    );

    const appHash = VersionService.generateHash(application.content);
    const guideHash = VersionService.generateHash(guideline.content);

    // Run AI analysis
    const aiResult = await AIService.analyzeApplication(
      guideline.title,
      guideline.content,
      application.title,
      application.content,
      supportingDocs,
      apiKey,
      provider
    );

    // Calculate initial deterministic score
    const scoreResult = ScoringService.calculateScore(
      aiResult.requirements,
      supportingDocs,
      aiResult.unsubstantiated_claims
    );

    // Check if an assessment already exists for this pair
    let assessment = await dbGet<any>(
      `SELECT id FROM assessments WHERE application_id = ? AND guideline_id = ?`,
      [applicationId, guidelineId]
    );

    const assessmentId = assessment ? assessment.id : uuidv4();

    await dbRun(
      `INSERT INTO assessments (
        id, application_id, guideline_id, app_version_analyzed, guideline_version_analyzed,
        app_hash_analyzed, guideline_hash_analyzed, is_stale,
        deterministic_score, mandatory_score, recommended_score,
        total_requirements, mandatory_count, mandatory_fulfilled,
        recommended_count, recommended_fulfilled, missing_docs_count,
        unsubstantiated_claims_count, summary_markdown, legal_disclaimer_acknowledged, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        app_version_analyzed = excluded.app_version_analyzed,
        guideline_version_analyzed = excluded.guideline_version_analyzed,
        app_hash_analyzed = excluded.app_hash_analyzed,
        guideline_hash_analyzed = excluded.guideline_hash_analyzed,
        is_stale = 0,
        deterministic_score = excluded.deterministic_score,
        mandatory_score = excluded.mandatory_score,
        recommended_score = excluded.recommended_score,
        total_requirements = excluded.total_requirements,
        mandatory_count = excluded.mandatory_count,
        mandatory_fulfilled = excluded.mandatory_fulfilled,
        recommended_count = excluded.recommended_count,
        recommended_fulfilled = excluded.recommended_fulfilled,
        missing_docs_count = excluded.missing_docs_count,
        unsubstantiated_claims_count = excluded.unsubstantiated_claims_count,
        summary_markdown = excluded.summary_markdown,
        updated_at = CURRENT_TIMESTAMP`,
      [
        assessmentId,
        applicationId,
        guidelineId,
        application.version,
        guideline.version,
        appHash,
        guideHash,
        scoreResult.deterministic_score,
        scoreResult.mandatory_score,
        scoreResult.recommended_score,
        scoreResult.total_requirements,
        scoreResult.mandatory_count,
        scoreResult.mandatory_fulfilled,
        scoreResult.recommended_count,
        scoreResult.recommended_fulfilled,
        scoreResult.missing_docs_count,
        scoreResult.unsubstantiated_claims_count,
        aiResult.summary_markdown,
      ]
    );

    // Save requirements
    await dbRun(`DELETE FROM requirements WHERE assessment_id = ?`, [assessmentId]);
    for (const reqItem of aiResult.requirements) {
      await dbRun(
        `INSERT INTO requirements (
          id, assessment_id, req_code, category, title, description,
          is_mandatory, guideline_citation, mapping_status, evidence_strength,
          human_status, application_citation, missing_elements,
          clarification_question, confidence_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
        [
          uuidv4(),
          assessmentId,
          reqItem.req_code,
          reqItem.category,
          reqItem.title,
          reqItem.description,
          reqItem.is_mandatory ? 1 : 0,
          JSON.stringify(reqItem.guideline_citation),
          reqItem.mapping_status,
          reqItem.evidence_strength,
          JSON.stringify(reqItem.application_citation),
          JSON.stringify(reqItem.missing_elements || []),
          reqItem.clarification_question || null,
          reqItem.confidence_score,
        ]
      );
    }

    // Save claims
    await dbRun(`DELETE FROM unsubstantiated_claims WHERE assessment_id = ?`, [assessmentId]);
    for (const claim of aiResult.unsubstantiated_claims) {
      await dbRun(
        `INSERT INTO unsubstantiated_claims (
          id, assessment_id, claim_text, section, severity, explanation, recommended_evidence, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'flagged')`,
        [
          uuidv4(),
          assessmentId,
          claim.claim_text,
          claim.section,
          claim.severity,
          claim.explanation,
          claim.recommended_evidence,
        ]
      );
    }

    // Save questions
    await dbRun(`DELETE FROM clarification_questions WHERE assessment_id = ?`, [assessmentId]);
    for (const q of aiResult.clarification_questions) {
      await dbRun(
        `INSERT INTO clarification_questions (
          id, assessment_id, question, priority, context_hint, status
        ) VALUES (?, ?, ?, ?, ?, 'open')`,
        [uuidv4(), assessmentId, q.question, q.priority, q.context_hint]
      );
    }

    await StructuredLogger.audit(
      'AI_ANALYSIS_COMPLETED',
      'AI_AGENT',
      {
        assessmentId,
        applicationId,
        guidelineId,
        score: scoreResult.deterministic_score,
        modelUsed: aiResult.model_used,
        requirementsExtracted: aiResult.requirements.length,
      },
      assessmentId
    );

    res.json({
      success: true,
      assessmentId,
      score: scoreResult.deterministic_score,
      modelUsed: aiResult.model_used,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Human Review: Confirm, Correct, or Reject a Requirement Mapping
assessmentRouter.post('/:id/requirements/:reqId/review', async (req: Request, res: Response) => {
  try {
    const { id, reqId } = req.params;
    const { humanStatus, humanNotes, mappingStatus, evidenceStrength, correctedQuote } = req.body;

    const requirement = await dbGet<any>(
      `SELECT * FROM requirements WHERE id = ? AND assessment_id = ?`,
      [reqId, id]
    );

    if (!requirement) {
      return res.status(404).json({ success: false, error: 'Requirement not found' });
    }

    let appCitation = requirement.application_citation ? JSON.parse(requirement.application_citation) : {};
    if (correctedQuote) {
      appCitation.quote = correctedQuote;
    }
    if (evidenceStrength) {
      appCitation.evidence_strength = evidenceStrength;
    }

    const updatedMappingStatus = mappingStatus || requirement.mapping_status;
    const updatedStrength = evidenceStrength || requirement.evidence_strength;

    await dbRun(
      `UPDATE requirements
       SET human_status = ?, human_notes = ?, mapping_status = ?, evidence_strength = ?, application_citation = ?
       WHERE id = ?`,
      [
        humanStatus,
        humanNotes || requirement.human_notes,
        updatedMappingStatus,
        updatedStrength,
        JSON.stringify(appCitation),
        reqId,
      ]
    );

    // Deterministically recalculate assessment score
    await recalculateAndSaveAssessment(id);

    await StructuredLogger.audit(
      `HUMAN_${humanStatus.toUpperCase()}_MAPPING`,
      'HUMAN_USER',
      { reqId, reqCode: requirement.req_code, humanStatus, mappingStatus: updatedMappingStatus, evidenceStrength: updatedStrength },
      id
    );

    res.json({ success: true, message: `Requirement ${requirement.req_code} updated to ${humanStatus}.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update claim status (flagged / resolved / dismissed)
assessmentRouter.post('/:id/claims/:claimId/status', async (req: Request, res: Response) => {
  try {
    const { id, claimId } = req.params;
    const { status } = req.body;

    await dbRun(
      `UPDATE unsubstantiated_claims SET status = ? WHERE id = ? AND assessment_id = ?`,
      [status, claimId, id]
    );

    await recalculateAndSaveAssessment(id);

    await StructuredLogger.audit(
      'CLAIM_STATUS_UPDATED',
      'HUMAN_USER',
      { claimId, newStatus: status },
      id
    );

    res.json({ success: true, message: `Claim marked as ${status}.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Answer clarification question
assessmentRouter.post('/:id/questions/:questionId/answer', async (req: Request, res: Response) => {
  try {
    const { id, questionId } = req.params;
    const { applicantResponse, status } = req.body;

    await dbRun(
      `UPDATE clarification_questions
       SET applicant_response = ?, status = ?
       WHERE id = ? AND assessment_id = ?`,
      [applicantResponse, status || 'resolved', questionId, id]
    );

    await StructuredLogger.audit(
      'CLARIFICATION_QUESTION_ANSWERED',
      'HUMAN_USER',
      { questionId, status: status || 'resolved' },
      id
    );

    res.json({ success: true, message: 'Clarification response saved.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Toggle supporting document attachment
assessmentRouter.post('/:id/supporting-docs/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { docId, isAttached } = req.body;

    await dbRun(
      `UPDATE supporting_documents SET is_attached = ? WHERE id = ?`,
      [isAttached ? 1 : 0, docId]
    );

    await recalculateAndSaveAssessment(id);

    await StructuredLogger.audit(
      'SUPPORTING_DOC_ATTACHED_TOGGLED',
      'HUMAN_USER',
      { docId, isAttached },
      id
    );

    res.json({ success: true, message: `Supporting document attachment updated.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Acknowledge advisory disclaimer
assessmentRouter.post('/:id/disclaimer/ack', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await dbRun(`UPDATE assessments SET legal_disclaimer_acknowledged = 1 WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Legal disclaimer acknowledged.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Audit logs query for assessment
assessmentRouter.get('/:id/audit-logs', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const logs = await dbAll<any>(
      `SELECT * FROM audit_logs WHERE assessment_id = ? OR assessment_id IS NULL ORDER BY created_at DESC LIMIT 50`,
      [id]
    );
    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Helper to recalculate deterministic scores and persist to assessment record
 */
async function recalculateAndSaveAssessment(assessmentId: string) {
  const assessment = await dbGet<any>(`SELECT * FROM assessments WHERE id = ?`, [assessmentId]);
  if (!assessment) return;

  const rawReqs = await dbAll<any>(`SELECT * FROM requirements WHERE assessment_id = ?`, [assessmentId]);
  const reqs = rawReqs.map((r) => ({
    ...r,
    is_mandatory: r.is_mandatory === 1,
  }));

  const docs = await dbAll<any>(`SELECT * FROM supporting_documents WHERE application_id = ?`, [assessment.application_id]);
  const claims = await dbAll<any>(`SELECT * FROM unsubstantiated_claims WHERE assessment_id = ?`, [assessmentId]);

  const scoreResult = ScoringService.calculateScore(reqs, docs, claims);

  await dbRun(
    `UPDATE assessments SET
      deterministic_score = ?,
      mandatory_score = ?,
      recommended_score = ?,
      total_requirements = ?,
      mandatory_count = ?,
      mandatory_fulfilled = ?,
      recommended_count = ?,
      recommended_fulfilled = ?,
      missing_docs_count = ?,
      unsubstantiated_claims_count = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      scoreResult.deterministic_score,
      scoreResult.mandatory_score,
      scoreResult.recommended_score,
      scoreResult.total_requirements,
      scoreResult.mandatory_count,
      scoreResult.mandatory_fulfilled,
      scoreResult.recommended_count,
      scoreResult.recommended_fulfilled,
      scoreResult.missing_docs_count,
      scoreResult.unsubstantiated_claims_count,
      assessmentId,
    ]
  );
}
