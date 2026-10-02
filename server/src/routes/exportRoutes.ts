import { Router, Request, Response } from 'express';
import { dbGet, dbAll } from '../db/database';
import { ScoringService } from '../services/scoringService';

export const exportRouter = Router();

exportRouter.get('/summary/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { format } = req.query; // 'markdown' | 'json'

    const assessment = await dbGet<any>(`SELECT * FROM assessments WHERE id = ?`, [id]);
    if (!assessment) return res.status(404).json({ success: false, error: 'Assessment not found' });

    const application = await dbGet<any>(`SELECT * FROM applications WHERE id = ?`, [assessment.application_id]);
    const guideline = await dbGet<any>(`SELECT * FROM guidelines WHERE id = ?`, [assessment.guideline_id]);
    const supportingDocs = await dbAll<any>(`SELECT * FROM supporting_documents WHERE application_id = ?`, [assessment.application_id]);
    const rawReqs = await dbAll<any>(`SELECT * FROM requirements WHERE assessment_id = ? ORDER BY req_code ASC`, [id]);
    const claims = await dbAll<any>(`SELECT * FROM unsubstantiated_claims WHERE assessment_id = ?`, [id]);
    const questions = await dbAll<any>(`SELECT * FROM clarification_questions WHERE assessment_id = ?`, [id]);

    const reqs = rawReqs.map((r) => ({
      ...r,
      is_mandatory: r.is_mandatory === 1,
      guideline_citation: r.guideline_citation ? JSON.parse(r.guideline_citation) : {},
      application_citation: r.application_citation ? JSON.parse(r.application_citation) : {},
      missing_elements: r.missing_elements ? JSON.parse(r.missing_elements) : [],
    }));

    const scoreResult = ScoringService.calculateScore(reqs, supportingDocs, claims);

    if (format === 'json') {
      return res.json({
        assessment,
        application,
        guideline,
        scoring: scoreResult,
        requirements: reqs,
        supportingDocs,
        unsubstantiatedClaims: claims,
        clarificationQuestions: questions,
      });
    }

    // Generate comprehensive Markdown export report
    let md = `# Grant Application Completeness & Review Summary\n\n`;
    md += `> **DISCLAIMER:** This report provides an advisory completeness evaluation. It does NOT constitute an authoritative legal or funding eligibility determination.\n\n`;
    md += `**Proposal Title:** ${application.title}\n`;
    md += `**Applicant Organization:** ${application.applicant_name || 'N/A'}\n`;
    md += `**Grant Guideline:** ${guideline.title}\n`;
    md += `**Evaluation Date:** ${new Date().toUTCString()}\n`;
    md += `**Overall Deterministic Completeness Score:** **${scoreResult.deterministic_score}%** (${scoreResult.readiness_level})\n\n`;

    md += `## 1. Executive Scorecard Breakdown\n\n`;
    md += `| Category | Fulfilled / Total | Score % | Weight |\n`;
    md += `|---|---|---|---|\n`;
    md += `| **Mandatory Requirements** | ${scoreResult.mandatory_fulfilled} / ${scoreResult.mandatory_count} | ${scoreResult.mandatory_score}% | 75% |\n`;
    md += `| **Recommended Practices** | ${scoreResult.recommended_fulfilled} / ${scoreResult.recommended_count} | ${scoreResult.recommended_score}% | 25% |\n`;
    md += `| **Missing Supporting Docs** | ${scoreResult.missing_docs_count} missing | -${scoreResult.breakdown.doc_penalty_points} pts | Penalty |\n`;
    md += `| **Unsubstantiated Claims** | ${scoreResult.unsubstantiated_claims_count} flagged | -${scoreResult.breakdown.claim_penalty_points} pts | Penalty |\n\n`;

    md += `## 2. Requirement Citation & Mapping Details\n\n`;
    for (const r of reqs) {
      const icon = r.mapping_status === 'fulfilled' ? '✅' : r.mapping_status === 'partially_fulfilled' ? '⚠️' : '❌';
      const humanBadge = r.human_status !== 'pending' ? ` [Human: ${r.human_status.toUpperCase()}]` : '';
      md += `### ${icon} ${r.req_code}: ${r.title} ${humanBadge}\n`;
      md += `- **Type:** ${r.is_mandatory ? '**Mandatory Requirement**' : 'Recommended Consideration'}\n`;
      md += `- **Status:** \`${r.mapping_status}\` (Evidence Strength: \`${r.evidence_strength}\`)\n`;
      md += `- **Guideline Citation:** *${r.guideline_citation.section || 'N/A'}* — "${r.guideline_citation.quote || 'N/A'}"\n`;
      md += `- **Application Evidence:** *${r.application_citation.section || 'N/A'}* — "${r.application_citation.quote || 'No evidence mapped'}"\n`;
      if (r.missing_elements && r.missing_elements.length > 0) {
        md += `- **Missing Elements:** ${r.missing_elements.join('; ')}\n`;
      }
      if (r.human_notes) {
        md += `- **Human Reviewer Note:** ${r.human_notes}\n`;
      }
      md += `\n`;
    }

    md += `## 3. Supporting Documents Status\n\n`;
    for (const d of supportingDocs) {
      const dIcon = d.is_attached ? '✅ Attached' : '❌ MISSING';
      const dMand = d.is_mandatory ? '(Mandatory)' : '(Optional)';
      md += `- ${dIcon}: **${d.name}** ${dMand} — *${d.description || ''}*\n`;
    }
    md += `\n`;

    if (claims.length > 0) {
      md += `## 4. Unsubstantiated Claims & Evidence Gaps\n\n`;
      for (const c of claims) {
        md += `- **[${c.severity.toUpperCase()}]** "${c.claim_text}"\n`;
        md += `  - *Issue:* ${c.explanation}\n`;
        md += `  - *Recommended Action:* ${c.recommended_evidence}\n`;
      }
      md += `\n`;
    }

    if (questions.length > 0) {
      md += `## 5. Actionable Clarification Questions for Applicant\n\n`;
      for (const q of questions) {
        const qStatus = q.status === 'resolved' ? '✅ Addressed' : '⏳ Open';
        md += `- **[${q.priority.toUpperCase()}] ${qStatus}**: ${q.question}\n`;
        if (q.applicant_response) {
          md += `  - *Applicant Clarification:* ${q.applicant_response}\n`;
        }
      }
      md += `\n`;
    }

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="completeness_report_${application.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md"`);
    res.send(md);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
