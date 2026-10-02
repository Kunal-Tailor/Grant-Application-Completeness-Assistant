import React, { useState } from 'react';
import { Key, Sparkles, X, Check, Shield } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  provider: string;
  onSave: (apiKey: string, provider: string) => void;
}

export const ApiKeyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  apiKey,
  provider,
  onSave,
}) => {
  const [localKey, setLocalKey] = useState(apiKey);
  const [localProvider, setLocalProvider] = useState(provider);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel-elevated"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '28px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '8px', borderRadius: '8px', display: 'flex' }}>
              <Key size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>AI Engine Configuration</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Configure live LLM API keys or use the smart built-in analyzer
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              Analysis Engine Mode
            </label>
            <select
              value={localProvider}
              onChange={(e) => setLocalProvider(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
              }}
            >
              <option value="builtin">Built-in Semantic & NLP Analyzer (Fast, Zero Setup, Deterministic)</option>
              <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
            </select>
          </div>

          {localProvider === 'openai' && (
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                OpenAI API Key
              </label>
              <input
                type="password"
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="sk-..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                }}
              />
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Keys are stored only in your local browser session and never saved permanently.
              </div>
            </div>
          )}

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              gap: '8px',
            }}
          >
            <Shield size={16} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
            <div>
              The <strong>Built-in Semantic Analyzer</strong> runs deterministic keyword mapping and evidence parsing without needing any external API credentials.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(localKey, localProvider);
                onClose();
              }}
              className="btn btn-primary"
            >
              <Check size={16} /> Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
