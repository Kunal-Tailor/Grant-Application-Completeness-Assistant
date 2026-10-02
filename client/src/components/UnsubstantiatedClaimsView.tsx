import React from 'react';
import { UnsubstantiatedClaim } from '../types';
import { Flame, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

interface Props {
  claims: UnsubstantiatedClaim[];
  onUpdateClaimStatus: (claimId: string, status: 'flagged' | 'resolved' | 'dismissed') => Promise<void>;
}

export const UnsubstantiatedClaimsView: React.FC<Props> = ({ claims, onUpdateClaimStatus }) => {
  const activeClaims = claims.filter((c) => c.status === 'flagged');
  const resolvedClaims = claims.filter((c) => c.status === 'resolved' || c.status === 'dismissed');

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={18} style={{ color: '#f59e0b' }} />
            Unsubstantiated Claims & Hyperbolic Assertions
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Flagged statements in the draft application that claim performance or partner guarantees without verified empirical backing.
          </p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            background: activeClaims.length > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: activeClaims.length > 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
            color: activeClaims.length > 0 ? '#fbbf24' : '#34d399',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}
        >
          {activeClaims.length > 0 ? (
            <>
              <AlertTriangle size={15} />
              {activeClaims.length} Active Unsubstantiated Claim{activeClaims.length > 1 ? 's' : ''}
            </>
          ) : (
            <>
              <ShieldCheck size={15} />
              All Claims Substantiated
            </>
          )}
        </div>
      </div>

      {claims.length === 0 ? (
        <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ShieldCheck size={40} style={{ margin: '0 auto 12px', color: '#10b981', opacity: 0.8 }} />
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No Unsupported Claims Detected</div>
          <div style={{ fontSize: '0.82rem' }}>All statements in the draft application appear grounded with appropriate caveats.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {claims.map((claim) => {
            const isResolved = claim.status === 'resolved' || claim.status === 'dismissed';
            let sevBadge = 'badge-missing';
            if (claim.severity === 'medium') sevBadge = 'badge-partial';
            else if (claim.severity === 'low') sevBadge = 'badge-cyan';

            return (
              <div
                key={claim.id}
                style={{
                  background: isResolved ? 'rgba(255, 255, 255, 0.02)' : 'rgba(245, 158, 11, 0.04)',
                  border: isResolved ? '1px solid var(--border-subtle)' : '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px 20px',
                  opacity: isResolved ? 0.75 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span className={`badge ${sevBadge}`}>
                        {claim.severity.toUpperCase()} SEVERITY
                      </span>
                      {claim.section && (
                        <span className="badge badge-cyan">{claim.section}</span>
                      )}
                      {isResolved && (
                        <span className="badge badge-fulfilled">
                          <CheckCircle2 size={12} /> {claim.status.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: isResolved ? 'var(--text-secondary)' : '#fef08a',
                        fontStyle: 'italic',
                        marginBottom: '8px',
                      }}
                    >
                      "{claim.claim_text}"
                    </div>

                    <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      <strong>Why this was flagged:</strong> {claim.explanation}
                    </div>

                    <div
                      style={{
                        background: 'rgba(56, 189, 248, 0.05)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '0.8rem',
                        color: '#bae6fd',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <ArrowRight size={14} style={{ color: '#38bdf8', flexShrink: 0 }} />
                      <span><strong>Recommended Proof:</strong> {claim.recommended_evidence}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {claim.status === 'flagged' ? (
                      <>
                        <button
                          onClick={() => onUpdateClaimStatus(claim.id, 'resolved')}
                          className="btn btn-sm btn-success"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          <CheckCircle2 size={13} /> Mark Resolved
                        </button>
                        <button
                          onClick={() => onUpdateClaimStatus(claim.id, 'dismissed')}
                          className="btn btn-sm btn-secondary"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          <XCircle size={13} /> Dismiss
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onUpdateClaimStatus(claim.id, 'flagged')}
                        className="btn btn-sm btn-secondary"
                      >
                        Re-Flag Claim
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
