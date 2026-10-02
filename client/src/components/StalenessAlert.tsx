import React from 'react';
import { AlertTriangle, RefreshCw, Clock } from 'lucide-react';

interface Props {
  isStale: boolean | number;
  reason?: string;
  onReanalyze: () => void;
  isLoading: boolean;
}

export const StalenessAlert: React.FC<Props> = ({ isStale, reason, onReanalyze, isLoading }) => {
  if (!isStale) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.14) 0%, rgba(220, 38, 38, 0.22) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.45)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        animation: 'slideInUp 0.3s ease-out',
        boxShadow: '0 4px 20px rgba(239, 68, 68, 0.15)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.25)',
            padding: '10px',
            borderRadius: '10px',
            color: '#f87171',
            display: 'flex',
          }}
        >
          <AlertTriangle size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fee2e2', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Assessment Outdated (Stale Version Detected)</span>
            <span
              style={{
                fontSize: '0.72rem',
                background: 'rgba(239, 68, 68, 0.3)',
                padding: '2px 8px',
                borderRadius: '4px',
                color: '#fca5a5',
              }}
            >
              Action Required
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#fecaca', marginTop: '2px' }}>
            {reason || 'The underlying grant guideline or application draft content has been modified since this evaluation.'}
          </div>
        </div>
      </div>
      <button
        onClick={onReanalyze}
        disabled={isLoading}
        className="btn btn-primary"
        style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          borderColor: 'rgba(239, 68, 68, 0.5)',
          boxShadow: '0 2px 10px rgba(239, 68, 68, 0.4)',
        }}
      >
        <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
        {isLoading ? 'Re-Analyzing...' : 'Re-Assess with AI'}
      </button>
    </div>
  );
};
