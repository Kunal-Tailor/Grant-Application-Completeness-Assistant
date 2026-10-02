import React from 'react';
import { ScenarioMeta } from '../types';
import {
  Sparkles,
  RefreshCw,
  Download,
  Activity,
  Key,
  Layers,
  ChevronDown,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';

interface Props {
  scenarios: ScenarioMeta[];
  selectedScenarioId: string;
  onSelectScenario: (id: string) => void;
  onReanalyze: () => void;
  isAnalyzing: boolean;
  onOpenApiKeyModal: () => void;
  onOpenAuditLogs: () => void;
  onOpenExportModal: () => void;
  provider: string;
}

export const Header: React.FC<Props> = ({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  onReanalyze,
  isAnalyzing,
  onOpenApiKeyModal,
  onOpenAuditLogs,
  onOpenExportModal,
  provider,
}) => {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(10, 14, 23, 0.85)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '12px 28px',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Left: Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #818cf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)',
            }}
          >
            <FileCheck2 size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Grant Completeness <span className="text-gradient">Assistant</span>
              </h1>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                v1.0 Pro
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Deterministic verification • Citation source mapping • Evidence gap audit
            </div>
          </div>
        </div>

        {/* Center: Scenario Quick-Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 10px',
            }}
          >
            <Layers size={15} style={{ color: '#38bdf8' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Scenario:</span>
            <select
              value={selectedScenarioId}
              onChange={(e) => onSelectScenario(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
                maxWidth: '260px',
              }}
            >
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id} style={{ background: '#111726', color: '#f1f5f9' }}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Actions Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onReanalyze}
            disabled={isAnalyzing}
            className="btn btn-primary btn-sm"
          >
            <RefreshCw size={14} className={isAnalyzing ? 'animate-spin' : ''} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Re-Run AI Assessment'}</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="btn btn-secondary btn-sm"
            title="Export Completeness Report"
          >
            <Download size={14} />
            <span>Export Report</span>
          </button>

          <button
            onClick={onOpenAuditLogs}
            className="btn btn-secondary btn-sm"
            title="View Audit Trail & AI Logs"
          >
            <Activity size={14} />
            <span>Audit Trail</span>
          </button>

          <button
            onClick={onOpenApiKeyModal}
            className="btn btn-secondary btn-sm"
            title="Configure AI Engine"
          >
            <Key size={14} />
            <span style={{ fontSize: '0.74rem' }}>
              {provider === 'openai' ? 'OpenAI' : 'Built-in AI'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
