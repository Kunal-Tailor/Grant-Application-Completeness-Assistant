import React, { useState } from 'react';
import { Requirement } from '../types';
import { HumanReviewModal } from './HumanReviewModal';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Quote,
  Sparkles,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  requirement: Requirement;
  onReview: (payload: {
    humanStatus: 'confirmed' | 'corrected' | 'rejected' | 'pending';
    humanNotes?: string;
    mappingStatus?: 'fulfilled' | 'partially_fulfilled' | 'missing' | 'ambiguous';
    evidenceStrength?: 'strong' | 'moderate' | 'weak' | 'none';
    correctedQuote?: string;
  }) => Promise<void>;
}

export const RequirementCard: React.FC<Props> = ({ requirement, onReview }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Status mapping badge helpers
  let statusBadgeClass = 'badge-fulfilled';
  let StatusIcon = CheckCircle2;
  let statusLabel = 'Fulfilled';

  if (requirement.mapping_status === 'missing') {
    statusBadgeClass = 'badge-missing';
    StatusIcon = XCircle;
    statusLabel = 'Missing Evidence';
  } else if (requirement.mapping_status === 'ambiguous') {
    statusBadgeClass = 'badge-partial';
    StatusIcon = HelpCircle;
    statusLabel = 'Ambiguous Evidence';
  } else if (requirement.mapping_status === 'partially_fulfilled') {
    statusBadgeClass = 'badge-partial';
    StatusIcon = AlertTriangle;
    statusLabel = 'Partially Fulfilled';
  }

  // Evidence strength pill color
  let strengthColor = '#10b981';
  if (requirement.evidence_strength === 'moderate') strengthColor = '#f59e0b';
  else if (requirement.evidence_strength === 'weak') strengthColor = '#f97316';
  else if (requirement.evidence_strength === 'none') strengthColor = '#f43f5e';

  // Human review status badge
  const isConfirmed = requirement.human_status === 'confirmed';
  const isCorrected = requirement.human_status === 'corrected';
  const isRejected = requirement.human_status === 'rejected';

  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px',
        marginBottom: '16px',
        borderLeft: requirement.is_mandatory ? '4px solid #ef4444' : '4px solid #818cf8',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <span className="badge badge-cyan" style={{ fontFamily: 'var(--font-mono)' }}>
              {requirement.req_code}
            </span>
            <span className={requirement.is_mandatory ? 'badge badge-mandatory' : 'badge badge-recommended'}>
              {requirement.is_mandatory ? 'Mandatory Gate' : 'Recommendation'}
            </span>
            <span className={`badge ${statusBadgeClass}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <StatusIcon size={12} />
              {statusLabel}
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: strengthColor,
                border: `1px solid ${strengthColor}44`,
              }}
            >
              Strength: {requirement.evidence_strength.toUpperCase()}
            </span>
            {requirement.confidence_score && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                AI Conf: {Math.round(requirement.confidence_score * 100)}%
              </span>
            )}

            {/* Human Verification Tag */}
            {isConfirmed && (
              <span className="badge badge-fulfilled" style={{ background: 'rgba(16, 185, 129, 0.25)' }}>
                <UserCheck size={12} /> Human Confirmed
              </span>
            )}
            {isCorrected && (
              <span className="badge badge-cyan" style={{ background: 'rgba(6, 182, 212, 0.25)' }}>
                <Edit size={12} /> Human Corrected
              </span>
            )}
            {isRejected && (
              <span className="badge badge-missing" style={{ background: 'rgba(244, 63, 94, 0.25)' }}>
                <XCircle size={12} /> Human Rejected
              </span>
            )}
          </div>

          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {requirement.title}
          </h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {requirement.description}
          </p>
        </div>

        {/* Human Action Button Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => onReview({ humanStatus: 'confirmed', mappingStatus: 'fulfilled', evidenceStrength: 'strong' })}
            title="Confirm AI Mapping"
            className={`btn btn-sm ${isConfirmed ? 'btn-success' : 'btn-secondary'}`}
            style={{ padding: '6px 10px' }}
          >
            <ThumbsUp size={14} />
            <span>Confirm</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            title="Edit / Correct Mapping Details"
            className={`btn btn-sm ${isCorrected ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 10px' }}
          >
            <Edit size={14} />
            <span>Edit</span>
          </button>

          <button
            onClick={() => onReview({ humanStatus: 'rejected', mappingStatus: 'missing', evidenceStrength: 'none' })}
            title="Reject AI Mapping"
            className={`btn btn-sm ${isRejected ? 'btn-danger' : 'btn-secondary'}`}
            style={{ padding: '6px 10px' }}
          >
            <ThumbsDown size={14} />
            <span>Reject</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px', marginLeft: '4px' }}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded Citations & Evidence Section */}
      {isExpanded && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Dual Citations Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Guideline Citation Box */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Quote size={13} style={{ color: '#38bdf8' }} />
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                  Guideline Citation ({requirement.guideline_citation?.section || 'Section'})
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.4 }}>
                "{requirement.guideline_citation?.quote || 'No direct guideline quote citation.'}"
              </div>
            </div>

            {/* Application Citation Box */}
            <div
              style={{
                background: requirement.application_citation?.quote
                  ? 'rgba(56, 189, 248, 0.03)'
                  : 'rgba(244, 63, 94, 0.03)',
                border: requirement.application_citation?.quote
                  ? '1px solid rgba(56, 189, 248, 0.2)'
                  : '1px solid rgba(244, 63, 94, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Quote size={13} style={{ color: '#818cf8' }} />
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>
                  Application Evidence ({requirement.application_citation?.section || 'Draft Content'})
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {requirement.application_citation?.quote ? (
                  <span>"{requirement.application_citation.quote}"</span>
                ) : (
                  <span style={{ color: '#f87171', fontStyle: 'italic' }}>
                    No matching evidence found in current draft application.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Missing Elements or Follow-up Hint */}
          {requirement.missing_elements && requirement.missing_elements.length > 0 && (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.06)',
                border: '1px dashed rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', marginBottom: '4px' }}>
                Identified Evidence Gaps / Missing Sub-Elements:
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: '#fde68a' }}>
                {requirement.missing_elements.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Human Reviewer Notes if present */}
          {requirement.human_notes && (
            <div
              style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                fontSize: '0.8rem',
                color: '#c7d2fe',
              }}
            >
              <strong>Auditor Note:</strong> {requirement.human_notes}
            </div>
          )}
        </div>
      )}

      {/* Override Modal */}
      <HumanReviewModal
        requirement={requirement}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onReview}
      />
    </div>
  );
};
