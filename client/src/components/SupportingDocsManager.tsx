import React from 'react';
import { SupportingDocument } from '../types';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  UploadCloud,
  FileCheck,
  FileWarning,
  Paperclip,
  Check,
  X,
} from 'lucide-react';

interface Props {
  documents: SupportingDocument[];
  onToggleDoc: (docId: string, isAttached: boolean) => Promise<void>;
}

export const SupportingDocsManager: React.FC<Props> = ({ documents, onToggleDoc }) => {
  const mandatoryDocs = documents.filter((d) => d.is_mandatory === 1 || d.is_mandatory === true);
  const optionalDocs = documents.filter((d) => !d.is_mandatory || d.is_mandatory === 0);

  const missingMandatoryCount = mandatoryDocs.filter((d) => !d.is_attached || d.is_attached === 0).length;

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Paperclip size={18} style={{ color: '#38bdf8' }} />
            Supporting Documents Checklist
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Verify required external attachments, certifications, bank guarantees, and letters of intent.
          </p>
        </div>

        {missingMandatoryCount > 0 ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            <FileWarning size={15} />
            {missingMandatoryCount} Required Attachment{missingMandatoryCount > 1 ? 's' : ''} Missing (-{missingMandatoryCount * 6} pts)
          </div>
        ) : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            <FileCheck size={15} />
            All Mandatory Documents Attached (0 Penalties)
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {documents.map((doc) => {
          const isAttached = doc.is_attached === 1 || doc.is_attached === true;
          const isMandatory = doc.is_mandatory === 1 || doc.is_mandatory === true;

          return (
            <div
              key={doc.id}
              style={{
                background: isAttached ? 'rgba(255, 255, 255, 0.02)' : 'rgba(244, 63, 94, 0.04)',
                border: isAttached
                  ? '1px solid var(--border-subtle)'
                  : '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    background: isAttached ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    color: isAttached ? '#34d399' : '#fb7185',
                    padding: '10px',
                    borderRadius: '8px',
                    display: 'flex',
                  }}
                >
                  {isAttached ? <FileCheck size={20} /> : <FileWarning size={20} />}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      {doc.name}
                    </span>
                    <span className={isMandatory ? 'badge badge-mandatory' : 'badge badge-recommended'}>
                      {isMandatory ? 'Mandatory Attachment' : 'Optional / Bonus'}
                    </span>
                    <span className="badge badge-cyan">{doc.doc_type}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {doc.description || 'Supporting verification document.'}
                  </div>
                  {doc.verified_tag && (
                    <div style={{ fontSize: '0.74rem', color: isAttached ? '#6ee7b7' : '#fda4af', marginTop: '2px' }}>
                      Status: {doc.verified_tag}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button: Toggle Attached Status */}
              <div>
                <button
                  onClick={() => onToggleDoc(doc.id, !isAttached)}
                  className={`btn btn-sm ${isAttached ? 'btn-success' : 'btn-primary'}`}
                  style={{ minWidth: '130px' }}
                >
                  {isAttached ? (
                    <>
                      <Check size={14} /> Attached (Verified)
                    </>
                  ) : (
                    <>
                      <UploadCloud size={14} /> Attach File
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
