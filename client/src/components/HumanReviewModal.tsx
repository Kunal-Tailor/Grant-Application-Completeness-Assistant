import React, { useState } from 'react';
import { Requirement } from '../types';
import { Check, X, Edit3, ShieldAlert, FileText, Sparkles } from 'lucide-react';

interface Props {
  requirement: Requirement;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    humanStatus: 'confirmed' | 'corrected' | 'rejected' | 'pending';
    humanNotes?: string;
    mappingStatus?: 'fulfilled' | 'partially_fulfilled' | 'missing' | 'ambiguous';
    evidenceStrength?: 'strong' | 'moderate' | 'weak' | 'none';
    correctedQuote?: string;
  }) => Promise<void>;
}

export const HumanReviewModal: React.FC<Props> = ({
  requirement,
  isOpen,
  onClose,
  onSave,
}) => {
  const [humanStatus, setHumanStatus] = useState<'confirmed' | 'corrected' | 'rejected'>(
    requirement.human_status !== 'pending' ? requirement.human_status : 'confirmed'
  );
  const [mappingStatus, setMappingStatus] = useState(requirement.mapping_status);
  const [evidenceStrength, setEvidenceStrength] = useState(requirement.evidence_strength);
  const [correctedQuote, setCorrectedQuote] = useState(requirement.application_citation?.quote || '');
  const [humanNotes, setHumanNotes] = useState(requirement.human_notes || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        humanStatus,
        humanNotes,
        mappingStatus,
        evidenceStrength,
        correctedQuote,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel-elevated"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-cyan">{requirement.req_code}</span>
              <span className={requirement.is_mandatory ? 'badge badge-mandatory' : 'badge badge-recommended'}>
                {requirement.is_mandatory ? 'Mandatory Gate' : 'Recommendation'}
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', marginTop: '8px' }}>Review & Override Mapping</h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Guideline Requirement Details */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Guideline Criterion ({requirement.guideline_citation?.section || 'Section'})
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '2px' }}>
            {requirement.title}
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
            "{requirement.guideline_citation?.quote}"
          </div>
        </div>

        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Human Review Decision Choice */}
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
              Human Auditor Determination *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setHumanStatus('confirmed');
                  setMappingStatus('fulfilled');
                  setEvidenceStrength('strong');
                }}
                className={`btn ${humanStatus === 'confirmed' ? 'btn-success' : 'btn-secondary'}`}
                style={{ padding: '10px' }}
              >
                <Check size={16} /> Confirm (Fulfilled)
              </button>
              <button
                type="button"
                onClick={() => setHumanStatus('corrected')}
                className={`btn ${humanStatus === 'corrected' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '10px' }}
              >
                <Edit3 size={16} /> Correct Mapping
              </button>
              <button
                type="button"
                onClick={() => {
                  setHumanStatus('rejected');
                  setMappingStatus('missing');
                  setEvidenceStrength('none');
                }}
                className={`btn ${humanStatus === 'rejected' ? 'btn-danger' : 'btn-secondary'}`}
                style={{ padding: '10px' }}
              >
                <X size={16} /> Reject (Unsatisfied)
              </button>
            </div>
          </div>

          {/* If Corrected: Show granular mapping dropdowns */}
          {humanStatus === 'corrected' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Fulfillment Status
                </label>
                <select
                  value={mappingStatus}
                  onChange={(e: any) => setMappingStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="fulfilled">Fulfilled (Fully Addressed)</option>
                  <option value="partially_fulfilled">Partially Fulfilled</option>
                  <option value="ambiguous">Ambiguous / Insufficient</option>
                  <option value="missing">Missing / Not Found</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Evidence Strength
                </label>
                <select
                  value={evidenceStrength}
                  onChange={(e: any) => setEvidenceStrength(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="strong">Strong (Definitive Proof)</option>
                  <option value="moderate">Moderate (Plausible/Basic)</option>
                  <option value="weak">Weak (Vague Assertion)</option>
                  <option value="none">None (No Evidence)</option>
                </select>
              </div>
            </div>
          )}

          {/* Application Evidence Quote */}
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              Supporting Evidence Citation (Application Snippet)
            </label>
            <textarea
              rows={3}
              value={correctedQuote}
              onChange={(e) => setCorrectedQuote(e.target.value)}
              placeholder="Paste or edit the exact application text that satisfies this requirement..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>

          {/* Human Reviewer Notes */}
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              Auditor Review Notes / Rationale
            </label>
            <textarea
              rows={2}
              value={humanNotes}
              onChange={(e) => setHumanNotes(e.target.value)}
              placeholder="Add internal notes on why this requirement was confirmed, modified, or rejected..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn btn-primary">
              <Check size={16} /> {isSaving ? 'Saving...' : 'Apply Determination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
