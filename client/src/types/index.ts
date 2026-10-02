export interface GuidelineCitation {
  section: string;
  quote: string;
  page_hint?: string;
}

export interface ApplicationCitation {
  section: string;
  quote: string;
  confidence_score: number;
  evidence_strength: 'strong' | 'moderate' | 'weak' | 'none';
}

export interface Requirement {
  id: string;
  assessment_id: string;
  req_code: string;
  category: 'Eligibility' | 'Technical Approach' | 'Budget & Financials' | 'Impact & Sustainability' | 'Governance & Compliance';
  title: string;
  description: string;
  is_mandatory: boolean;
  guideline_citation: GuidelineCitation;
  mapping_status: 'fulfilled' | 'partially_fulfilled' | 'missing' | 'ambiguous';
  evidence_strength: 'strong' | 'moderate' | 'weak' | 'none';
  human_status: 'pending' | 'confirmed' | 'corrected' | 'rejected';
  human_notes?: string;
  application_citation: ApplicationCitation;
  missing_elements: string[];
  clarification_question?: string;
  confidence_score: number;
}

export interface SupportingDocument {
  id: string;
  application_id: string;
  name: string;
  doc_type: string;
  description?: string;
  is_mandatory: boolean | number;
  is_attached: boolean | number;
  verified_tag?: string;
}

export interface UnsubstantiatedClaim {
  id: string;
  assessment_id: string;
  claim_text: string;
  section?: string;
  severity: 'high' | 'medium' | 'low';
  explanation: string;
  recommended_evidence: string;
  status: 'flagged' | 'resolved' | 'dismissed';
}

export interface ClarificationQuestion {
  id: string;
  assessment_id: string;
  requirement_id?: string;
  question: string;
  priority: 'critical' | 'high' | 'medium';
  context_hint?: string;
  applicant_response?: string;
  status: 'open' | 'resolved';
}

export interface ScoringDetails {
  deterministic_score: number;
  mandatory_score: number;
  recommended_score: number;
  total_requirements: number;
  mandatory_count: number;
  mandatory_fulfilled: number;
  recommended_count: number;
  recommended_fulfilled: number;
  missing_docs_count: number;
  unsubstantiated_claims_count: number;
  readiness_level: 'High Readiness' | 'Moderate Readiness' | 'Action Required (Critical Gaps)';
  readiness_description: string;
  breakdown: {
    mandatory_weight: number;
    recommended_weight: number;
    mandatory_raw_pct: number;
    recommended_raw_pct: number;
    doc_penalty_points: number;
    claim_penalty_points: number;
  };
}

export interface Assessment {
  id: string;
  application_id: string;
  guideline_id: string;
  app_version_analyzed: number;
  guideline_version_analyzed: number;
  app_hash_analyzed: string;
  guideline_hash_analyzed: string;
  is_stale: number;
  staleness_reason?: string;
  deterministic_score: number;
  mandatory_score: number;
  recommended_score: number;
  total_requirements: number;
  mandatory_count: number;
  mandatory_fulfilled: number;
  recommended_count: number;
  recommended_fulfilled: number;
  missing_docs_count: number;
  unsubstantiated_claims_count: number;
  summary_markdown: string;
  legal_disclaimer_acknowledged: number;
  status: string;
  created_at: string;
  updated_at: string;
  scoring_details: ScoringDetails;
}

export interface Application {
  id: string;
  guideline_id: string;
  title: string;
  applicant_name?: string;
  content: string;
  version: number;
  hash: string;
  created_at: string;
  updated_at: string;
}

export interface Guideline {
  id: string;
  title: string;
  content: string;
  version: number;
  hash: string;
  created_at: string;
  updated_at: string;
}

export interface ScenarioMeta {
  id: string;
  name: string;
  tagline: string;
  category: string;
  guidelineTitle: string;
  applicationTitle: string;
  docsCount: number;
}

export interface AuditLog {
  id: string;
  assessment_id?: string;
  action_type: string;
  actor: 'AI_AGENT' | 'HUMAN_USER' | 'SYSTEM';
  details_json: string;
  created_at: string;
}
