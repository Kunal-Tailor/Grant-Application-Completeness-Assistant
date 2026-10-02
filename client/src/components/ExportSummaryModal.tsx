import React, { useState } from 'react';
import { Assessment, Application, Guideline, Requirement, SupportingDocument } from '../types';
import { Download, Copy, Check, X, FileText, Share2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  assessment: Assessment;
  application: Application;
  guideline: Guideline;
}

export const ExportSummaryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  assessment,
  application,
  guideline,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownloadMarkdown = () => {
    window.open(`/api/export/summary/${assessment.id}`, '_blank');
  };

  const handleDownloadJson = () => {
    window.open(`/api/export/summary/${assessment.id}?format=json`, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(assessment.summary_markdown || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel-elevated"
        style={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '8px', borderRadius: '8px', display: 'flex' }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Export Completeness Report</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Download formal assessment summary in Markdown or structured JSON
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
          <button onClick={handleDownloadMarkdown} className="btn btn-primary" style={{ flex: 1 }}>
            <Download size={15} /> Download Markdown (.md)
          </button>
          <button onClick={handleDownloadJson} className="btn btn-secondary" style={{ flex: 1 }}>
            <Download size={15} /> Export JSON Data
          </button>
          <button onClick={handleCopy} className="btn btn-secondary">
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Markdown Preview Box */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            fontSize: '0.84rem',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'pre-wrap',
            maxHeight: '420px',
            overflowY: 'auto',
            lineHeight: 1.5,
          }}
        >
          {assessment.summary_markdown || 'No summary text available.'}
        </div>
      </div>
    </div>
  );
};
