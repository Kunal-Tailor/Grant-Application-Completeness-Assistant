export interface RequirementItem {
  id?: string;
  req_code: string;
  category: string;
  title: string;
  description: string;
  is_mandatory: boolean | number;
  mapping_status: 'fulfilled' | 'partially_fulfilled' | 'missing' | 'ambiguous';
  evidence_strength: 'strong' | 'moderate' | 'weak' | 'none';
  human_status?: 'pending' | 'confirmed' | 'corrected' | 'rejected';
  confidence_score?: number;
}

export interface SupportingDocItem {
  id?: string;
  name: string;
  is_mandatory: boolean | number;
  is_attached: boolean | number;
}

export interface UnsubstantiatedClaimItem {
  id?: string;
  severity: 'high' | 'medium' | 'low';
  status?: 'flagged' | 'resolved' | 'dismissed';
}

export interface ScoringResult {
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

export class ScoringService {
  /**
   * Deterministically calculates completeness score based on strict weighting,
   * evidence strength, human reviews, supporting doc completeness, and claim substantiation.
   */
  static calculateScore(
    requirements: RequirementItem[],
    supportingDocs: SupportingDocItem[] = [],
    unsubstantiatedClaims: UnsubstantiatedClaimItem[] = []
  ): ScoringResult {
    let mandatoryTotal = 0;
    let mandatoryEarned = 0;
    let mandatoryFulfilledCount = 0;

    let recommendedTotal = 0;
    let recommendedEarned = 0;
    let recommendedFulfilledCount = 0;

    for (const req of requirements) {
      const isMandatory = req.is_mandatory === 1 || req.is_mandatory === true;
      const humanStatus = req.human_status || 'pending';

      // Determine effective fulfillment factor
      let factor = 0;
      if (humanStatus === 'confirmed') {
        factor = 1.0;
      } else if (humanStatus === 'rejected') {
        factor = 0.0;
      } else {
        // Human pending or corrected with mapped status
        switch (req.evidence_strength) {
          case 'strong':
            factor = 1.0;
            break;
          case 'moderate':
            factor = 0.7;
            break;
          case 'weak':
            factor = 0.35;
            break;
          case 'none':
          default:
            factor = 0.0;
            break;
        }

        // Mapping status multiplier
        if (req.mapping_status === 'partially_fulfilled') {
          factor = Math.min(factor, 0.65);
        } else if (req.mapping_status === 'ambiguous') {
          factor = Math.min(factor, 0.4);
        } else if (req.mapping_status === 'missing') {
          factor = 0.0;
        }
      }

      if (isMandatory) {
        mandatoryTotal += 1;
        mandatoryEarned += factor;
        if (factor >= 0.7) {
          mandatoryFulfilledCount += 1;
        }
      } else {
        recommendedTotal += 1;
        recommendedEarned += factor;
        if (factor >= 0.7) {
          recommendedFulfilledCount += 1;
        }
      }
    }

    let mandatoryRawPct = 0;
    let recommendedRawPct = 0;
    let baseScore = 0;

    let mandatoryWeight = 0.75;
    let recommendedWeight = 0.25;

    if (mandatoryTotal > 0 && recommendedTotal > 0) {
      mandatoryRawPct = (mandatoryEarned / mandatoryTotal) * 100;
      recommendedRawPct = (recommendedEarned / recommendedTotal) * 100;
      baseScore = (mandatoryRawPct * mandatoryWeight) + (recommendedRawPct * recommendedWeight);
    } else if (mandatoryTotal > 0) {
      mandatoryWeight = 1.0;
      recommendedWeight = 0.0;
      mandatoryRawPct = (mandatoryEarned / mandatoryTotal) * 100;
      recommendedRawPct = 100;
      baseScore = mandatoryRawPct;
    } else if (recommendedTotal > 0) {
      mandatoryWeight = 0.0;
      recommendedWeight = 1.0;
      mandatoryRawPct = 100;
      recommendedRawPct = (recommendedEarned / recommendedTotal) * 100;
      baseScore = recommendedRawPct;
    } else {
      baseScore = 0;
    }

    // Supporting document penalties
    let missingMandatoryDocs = 0;
    for (const doc of supportingDocs) {
      const isMandatoryDoc = doc.is_mandatory === 1 || doc.is_mandatory === true;
      const isAttached = doc.is_attached === 1 || doc.is_attached === true;
      if (isMandatoryDoc && !isAttached) {
        missingMandatoryDocs += 1;
      }
    }
    const docPenalty = missingMandatoryDocs * 6.0; // 6 points per missing mandatory document

    // Unsubstantiated claims penalties (only active/flagged claims)
    let activeHighClaims = 0;
    let activeMedClaims = 0;
    let totalActiveClaims = 0;
    for (const claim of unsubstantiatedClaims) {
      if (!claim.status || claim.status === 'flagged') {
        totalActiveClaims += 1;
        if (claim.severity === 'high') activeHighClaims += 1;
        else if (claim.severity === 'medium') activeMedClaims += 1;
      }
    }
    const claimPenalty = (activeHighClaims * 4.0) + (activeMedClaims * 2.0);

    // Calculate final deterministic score clamped between 0 and 100
    let finalScore = Math.max(0, Math.min(100, Math.round((baseScore - docPenalty - claimPenalty) * 10) / 10));

    // Determine readiness level
    let readinessLevel: 'High Readiness' | 'Moderate Readiness' | 'Action Required (Critical Gaps)';
    let readinessDescription: string;

    const hasMandatoryGap = mandatoryFulfilledCount < mandatoryTotal;

    if (finalScore >= 88 && !hasMandatoryGap && missingMandatoryDocs === 0) {
      readinessLevel = 'High Readiness';
      readinessDescription = 'Application demonstrates strong alignment across mandatory criteria and supporting evidence.';
    } else if (finalScore >= 65 && mandatoryFulfilledCount >= Math.ceil(mandatoryTotal * 0.8)) {
      readinessLevel = 'Moderate Readiness';
      readinessDescription = 'Key elements are covered, but evidence weaknesses, ambiguous items, or minor gaps need addressing.';
    } else {
      readinessLevel = 'Action Required (Critical Gaps)';
      readinessDescription = 'Critical mandatory requirements or required supporting documents are missing or insufficiently substantiated.';
    }

    return {
      deterministic_score: finalScore,
      mandatory_score: Math.round(mandatoryRawPct * 10) / 10,
      recommended_score: Math.round(recommendedRawPct * 10) / 10,
      total_requirements: requirements.length,
      mandatory_count: mandatoryTotal,
      mandatory_fulfilled: mandatoryFulfilledCount,
      recommended_count: recommendedTotal,
      recommended_fulfilled: recommendedFulfilledCount,
      missing_docs_count: missingMandatoryDocs,
      unsubstantiated_claims_count: totalActiveClaims,
      readiness_level: readinessLevel,
      readiness_description: readinessDescription,
      breakdown: {
        mandatory_weight: mandatoryWeight * 100,
        recommended_weight: recommendedWeight * 100,
        mandatory_raw_pct: Math.round(mandatoryRawPct * 10) / 10,
        recommended_raw_pct: Math.round(recommendedRawPct * 10) / 10,
        doc_penalty_points: docPenalty,
        claim_penalty_points: claimPenalty,
      },
    };
  }
}
