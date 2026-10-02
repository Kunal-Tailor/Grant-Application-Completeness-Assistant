import React, { useState } from 'react';
import { ShieldAlert, Check, Info } from 'lucide-react';

interface Props {
  acknowledged: boolean | number;
  onAcknowledge: () => void;
}

export const LegalDisclaimerBanner: React.FC<Props> = ({ acknowledged, onAcknowledge }) => {
  const [dismissedLocally, setDismissedLocally] = useState(false);

  if (acknowledged || dismissedLocally) {
    return null;
  }

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.18) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: '0 4px 16px rgba(245, 158, 11, 0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.2)',
            padding: '8px',
            borderRadius: '8px',
            color: '#fbbf24',
            display: 'flex',
          }}
        >
          <ShieldAlert size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fef3c7' }}>
            Advisory Verification Notice
          </div>
          <div style={{ fontSize: '0.8rem', color: '#fde68a', lineHeight: 1.4 }}>
            The Grant Application Completeness Assistant evaluates structural completeness, citation mappings, and evidence gaps. 
            It <strong>does not make authoritative legal or funding-eligibility decisions</strong>. Final funding outcomes are determined solely by the granting agency.
          </div>
        </div>
      </div>
      <button
        onClick={() => {
          setDismissedLocally(true);
          onAcknowledge();
        }}
        className="btn btn-secondary btn-sm"
        style={{
          background: 'rgba(245, 158, 11, 0.25)',
          color: '#fef3c7',
          borderColor: 'rgba(245, 158, 11, 0.4)',
          fontWeight: 600,
        }}
      >
        <Check size={14} /> I Understand
      </button>
    </div>
  );
};
