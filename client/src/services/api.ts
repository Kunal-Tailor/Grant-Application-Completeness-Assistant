import {
  Assessment,
  Application,
  Guideline,
  Requirement,
  SupportingDocument,
  UnsubstantiatedClaim,
  ClarificationQuestion,
  ScenarioMeta,
  AuditLog,
} from '../types';

const API_BASE = '/api';

export const api = {
  // Scenarios
  getScenarios: async (): Promise<ScenarioMeta[]> => {
    const res = await fetch(`${API_BASE}/assessments/scenarios`);
    const data = await res.json();
    return data.scenarios;
  },

  loadScenario: async (scenarioId: string): Promise<string> => {
    const res = await fetch(`${API_BASE}/assessments/scenarios/load/${scenarioId}`, {
      method: 'POST',
    });
    const data = await res.json();
    return data.assessmentId;
  },

  // Assessment
  getAssessment: async (
    id: string
  ): Promise<{
    assessment: Assessment;
    application: Application;
    guideline: Guideline;
    supportingDocs: SupportingDocument[];
    requirements: Requirement[];
    unsubstantiatedClaims: UnsubstantiatedClaim[];
    clarificationQuestions: ClarificationQuestion[];
  }> => {
    const res = await fetch(`${API_BASE}/assessments/${id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch assessment');
    return data;
  },

  reanalyzeAssessment: async (
    applicationId: string,
    guidelineId: string,
    apiKey?: string,
    provider?: string
  ): Promise<{ assessmentId: string; score: number; modelUsed: string }> => {
    const res = await fetch(`${API_BASE}/assessments/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, guidelineId, apiKey, provider }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Analysis failed');
    return data;
  },

  // Human Review
  reviewRequirement: async (
    assessmentId: string,
    reqId: string,
    payload: {
      humanStatus: 'confirmed' | 'corrected' | 'rejected' | 'pending';
      humanNotes?: string;
      mappingStatus?: 'fulfilled' | 'partially_fulfilled' | 'missing' | 'ambiguous';
      evidenceStrength?: 'strong' | 'moderate' | 'weak' | 'none';
      correctedQuote?: string;
    }
  ): Promise<void> => {
    const res = await fetch(`${API_BASE}/assessments/${assessmentId}/requirements/${reqId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update review');
  },

  // Claims
  updateClaimStatus: async (
    assessmentId: string,
    claimId: string,
    status: 'flagged' | 'resolved' | 'dismissed'
  ): Promise<void> => {
    const res = await fetch(`${API_BASE}/assessments/${assessmentId}/claims/${claimId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update claim');
  },

  // Questions
  answerQuestion: async (
    assessmentId: string,
    questionId: string,
    applicantResponse: string,
    status?: 'open' | 'resolved'
  ): Promise<void> => {
    const res = await fetch(`${API_BASE}/assessments/${assessmentId}/questions/${questionId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicantResponse, status }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to save answer');
  },

  // Supporting Docs
  toggleSupportingDoc: async (
    assessmentId: string,
    docId: string,
    isAttached: boolean
  ): Promise<void> => {
    const res = await fetch(`${API_BASE}/assessments/${assessmentId}/supporting-docs/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId, isAttached }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to toggle document');
  },

  // Disclaimer Ack
  acknowledgeDisclaimer: async (assessmentId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/assessments/${assessmentId}/disclaimer/ack`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to acknowledge disclaimer');
  },

  // Documents Save & Versioning
  updateApplicationContent: async (
    appId: string,
    content: string,
    title?: string,
    changeSummary?: string
  ): Promise<{ version: number }> => {
    const res = await fetch(`${API_BASE}/applications/${appId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, title, changeSummary }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update application');
    return data;
  },

  updateGuidelineContent: async (
    guidelineId: string,
    content: string,
    title?: string,
    changeSummary?: string
  ): Promise<{ version: number }> => {
    const res = await fetch(`${API_BASE}/guidelines/${guidelineId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, title, changeSummary }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update guideline');
    return data;
  },

  // Audit Logs
  getAuditLogs: async (assessmentId: string): Promise<AuditLog[]> => {
    const res = await fetch(`${API_BASE}/assessments/${assessmentId}/audit-logs`);
    const data = await res.json();
    return data.logs || [];
  },
};
