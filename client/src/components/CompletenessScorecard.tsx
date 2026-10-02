import React from 'react';
import {
  ShieldCheck,
  AlertOctagon,
  FileCheck,
  HelpCircle,
  TrendingUp,
  FileWarning,
  Flame,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { ScoringDetails, Assessment } from '../types';

interface Props {
  scoring: ScoringDetails;
  assessment: Assessment;
  totalClaims: number;
  totalQuestions: number;
}

export const CompletenessScorecard: React.FC<Props> = ({
  scoring,
  assessment,
  totalClaims,
  totalQuestions,
}) => {
  const score = scoring?.deterministic_score ?? assessment?.deterministic_score ?? 0;
  const mandatoryScore = scoring?.mandatory_score ?? 0;
  const recommendedScore = scoring?.recommended_score ?? 0;

  // Determine color scheme based on score & readiness
  let scoreColor = '#10b981'; // Emerald
  let scoreBadgeBg = 'rgba(16, 185, 129, 0.15)';
  let scoreBadgeBorder = 'rgba(16, 185, 129, 0.35)';

  if (score < 65 || scoring?.readiness_level === 'Action Required (Critical Gaps)') {
    scoreColor = '#f43f5e'; // Rose
    scoreBadgeBg = 'rgba(244, 63, 94, 0.15)';
    scoreBadgeBorder = 'rgba(244, 63, 94, 0.35)';
  } else if (score < 88) {
    scoreColor = '#f59e0b'; // Amber
    scoreBadgeBg = 'rgba(245, 158, 11, 0.15)';
    scoreBadgeBorder = 'rgba(245, 158, 11, 0.35)';
  }

  // SVG Circular Gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) 1fr',
          gap: '28px',
          alignItems: 'center',
        }}
      >
        {/* Left: Interactive Radial Completeness Meter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            borderRight: '1px solid var(--border-subtle)',
            paddingRight: '20px',
          }}
        >
          <div style={{ position: 'relative', width: '148px', height: '148px', flexShrink: 0 }}>
            <svg width="148" height="148" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background Track */}
              <circle
                cx="74"
                cy="74"
                r={radius}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="11"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="74"
                cy="74"
                r={radius}
                stroke={scoreColor}
                strokeWidth="11"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease',
                  filter: `drop-shadow(0 0 10px ${scoreColor}55)`,
                }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                {Math.round(score)}%
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Completeness
              </span>
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: scoreBadgeBg,
                border: `1px solid ${scoreBadgeBorder}`,
                color: scoreColor,
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '8px',
              }}
            >
              {scoring?.readiness_level === 'High Readiness' ? (
                <ShieldCheck size={14} />
              ) : (
                <AlertOctagon size={14} />
              )}
              {scoring?.readiness_level || 'Calculating...'}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {scoring?.readiness_description || 'Deterministic calculation across weighted gates and evidence.'}
            </div>
          </div>
        </div>

        {/* Right: Detailed Metric Cards & Breakdown Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Progress Bars for Mandatory vs Recommended */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Mandatory Bar */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
                  Mandatory Gates (75% Wt)
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fca5a5' }}>
                  {scoring?.mandatory_fulfilled} / {scoring?.mandatory_count} ({Math.round(mandatoryScore)}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${mandatoryScore}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #f87171 0%, #ef4444 100%)',
                    borderRadius: '4px',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>

            {/* Recommended Bar */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8' }}></span>
                  Recommended (25% Wt)
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c7d2fe' }}>
                  {scoring?.recommended_fulfilled} / {scoring?.recommended_count} ({Math.round(recommendedScore)}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${recommendedScore}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #818cf8 0%, #6366f1 100%)',
                    borderRadius: '4px',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* 4 Key Summary Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '6px', borderRadius: '6px', display: 'flex' }}>
                <CheckCircle2 size={16} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {scoring?.total_requirements || 0}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mapped Criteria</div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: scoring?.missing_docs_count > 0 ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  background: scoring?.missing_docs_count > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: scoring?.missing_docs_count > 0 ? '#fb7185' : '#34d399',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                }}
              >
                <FileWarning size={16} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: scoring?.missing_docs_count > 0 ? '#fb7185' : 'var(--text-primary)' }}>
                  {scoring?.missing_docs_count}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Missing Docs</div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: totalClaims > 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  background: totalClaims > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                  color: totalClaims > 0 ? '#fbbf24' : '#38bdf8',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                }}
              >
                <Flame size={16} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: totalClaims > 0 ? '#fbbf24' : 'var(--text-primary)' }}>
                  {totalClaims}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Flagged Claims</div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', padding: '6px', borderRadius: '6px', display: 'flex' }}>
                <HelpCircle size={16} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {totalQuestions}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Clarifications</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
