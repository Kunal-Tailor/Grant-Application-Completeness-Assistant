import { describe, it, expect } from 'vitest';
import { ScoringService, RequirementItem, SupportingDocItem, UnsubstantiatedClaimItem } from '../services/scoringService';

describe('Deterministic Scoring Engine', () => {
  it('should calculate 100% when all mandatory and recommended requirements are strongly fulfilled and docs are attached', () => {
    const reqs: RequirementItem[] = [
      {
        req_code: 'REQ-01',
        category: 'Eligibility',
        title: 'Org Registration',
        description: 'Must be registered',
        is_mandatory: true,
        mapping_status: 'fulfilled',
        evidence_strength: 'strong',
        human_status: 'confirmed',
      },
      {
        req_code: 'REQ-02',
        category: 'Technical Approach',
        title: 'Work Plan',
        description: 'Deliverables',
        is_mandatory: true,
        mapping_status: 'fulfilled',
        evidence_strength: 'strong',
      },
      {
        req_code: 'REQ-03',
        category: 'Impact & Sustainability',
        title: 'Open Science',
        description: 'Bonus open repo',
        is_mandatory: false,
        mapping_status: 'fulfilled',
        evidence_strength: 'strong',
      },
    ];

    const docs: SupportingDocItem[] = [
      { name: 'Audit Report', is_mandatory: true, is_attached: true },
    ];

    const claims: UnsubstantiatedClaimItem[] = [];

    const result = ScoringService.calculateScore(reqs, docs, claims);
    expect(result.deterministic_score).toBe(100);
    expect(result.mandatory_fulfilled).toBe(2);
    expect(result.recommended_fulfilled).toBe(1);
    expect(result.missing_docs_count).toBe(0);
    expect(result.readiness_level).toBe('High Readiness');
  });

  it('should apply 75/25 weighting between mandatory and recommended requirements', () => {
    const reqs: RequirementItem[] = [
      {
        req_code: 'REQ-01',
        category: 'Eligibility',
        title: 'Mandatory Item 1',
        description: 'Test',
        is_mandatory: true,
        mapping_status: 'fulfilled',
        evidence_strength: 'strong',
      },
      {
        req_code: 'REQ-02',
        category: 'Impact',
        title: 'Recommended Item 1',
        description: 'Test',
        is_mandatory: false,
        mapping_status: 'missing',
        evidence_strength: 'none',
      },
    ];

    const result = ScoringService.calculateScore(reqs, [], []);
    // Mandatory 100% * 0.75 = 75, Recommended 0% * 0.25 = 0 -> Total 75
    expect(result.deterministic_score).toBe(75);
    expect(result.mandatory_score).toBe(100);
    expect(result.recommended_score).toBe(0);
  });

  it('should apply penalties for missing mandatory supporting documents', () => {
    const reqs: RequirementItem[] = [
      {
        req_code: 'REQ-01',
        category: 'Eligibility',
        title: 'Mandatory Item',
        description: 'Test',
        is_mandatory: true,
        mapping_status: 'fulfilled',
        evidence_strength: 'strong',
      },
      {
        req_code: 'REQ-02',
        category: 'Impact',
        title: 'Recommended Item',
        description: 'Test',
        is_mandatory: false,
        mapping_status: 'fulfilled',
        evidence_strength: 'strong',
      },
    ];

    const docs: SupportingDocItem[] = [
      { name: 'ISO Certificate', is_mandatory: true, is_attached: false }, // -6 points
    ];

    const result = ScoringService.calculateScore(reqs, docs, []);
    expect(result.missing_docs_count).toBe(1);
    expect(result.deterministic_score).toBe(94); // 100 - 6 = 94
  });

  it('should dynamically update score when human rejects or confirms a mapping', () => {
    const reqs: RequirementItem[] = [
      {
        req_code: 'REQ-01',
        category: 'Eligibility',
        title: 'Mandatory Item',
        description: 'Test',
        is_mandatory: true,
        mapping_status: 'fulfilled',
        evidence_strength: 'strong',
        human_status: 'rejected', // Human rejected this AI mapping
      },
    ];

    const result = ScoringService.calculateScore(reqs, [], []);
    expect(result.deterministic_score).toBe(0);
    expect(result.readiness_level).toBe('Action Required (Critical Gaps)');
  });
});
