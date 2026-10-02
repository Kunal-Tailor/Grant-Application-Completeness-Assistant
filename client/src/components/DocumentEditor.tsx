import React, { useState, useEffect } from 'react';
import { Application, Guideline } from '../types';
import { FileCode, Save, History, Check, AlertTriangle, Hash, Sparkles } from 'lucide-react';

interface Props {
  application: Application;
  guideline: Guideline;
  onSaveApplication: (content: string, title?: string, summary?: string) => Promise<void>;
  onSaveGuideline: (content: string, title?: string, summary?: string) => Promise<void>;
}

export const DocumentEditor: React.FC<Props> = ({
  application,
  guideline,
  onSaveApplication,
  onSaveGuideline,
}) => {
  const [appContent, setAppContent] = useState(application?.content || '');
  const [appTitle, setAppTitle] = useState(application?.title || '');
  const [guideContent, setGuideContent] = useState(guideline?.content || '');
  const [guideTitle, setGuideTitle] = useState(guideline?.title || '');

  const [savingApp, setSavingApp] = useState(false);
  const [savingGuide, setSavingGuide] = useState(false);
  const [appSuccess, setAppSuccess] = useState(false);
  const [guideSuccess, setGuideSuccess] = useState(false);

  useEffect(() => {
    setAppContent(application?.content || '');
    setAppTitle(application?.title || '');
  }, [application]);

  useEffect(() => {
    setGuideContent(guideline?.content || '');
    setGuideTitle(guideline?.title || '');
  }, [guideline]);

  const handleSaveApp = async () => {
    setSavingApp(true);
    try {
      await onSaveApplication(appContent, appTitle, 'Revised draft text via Workbench Editor');
      setAppSuccess(true);
      setTimeout(() => setAppSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingApp(false);
    }
  };

  const handleSaveGuide = async () => {
    setSavingGuide(true);
    try {
      await onSaveGuideline(guideContent, guideTitle, 'Updated guideline criteria via Workbench Editor');
      setGuideSuccess(true);
      setTimeout(() => setGuideSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingGuide(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Draft Application Editor Pane */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-cyan">Draft Application</span>
              <span className="badge badge-fulfilled">Version v{application?.version || 1}</span>
            </div>
            <input
              type="text"
              value={appTitle}
              onChange={(e) => setAppTitle(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px dashed var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontWeight: 700,
                marginTop: '6px',
                width: '100%',
                padding: '4px 0',
              }}
            />
          </div>

          <button
            onClick={handleSaveApp}
            disabled={savingApp}
            className={`btn btn-sm ${appSuccess ? 'btn-success' : 'btn-primary'}`}
          >
            {appSuccess ? <Check size={14} /> : <Save size={14} />}
            {savingApp ? 'Saving...' : appSuccess ? 'Version Saved!' : 'Save (Bump v' + ((application?.version || 1) + 1) + ')'}
          </button>
        </div>

        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)' }}>
          <Hash size={12} /> SHA-256: {application?.hash ? application.hash.substring(0, 16) + '...' : 'pending'}
        </div>

        <textarea
          value={appContent}
          onChange={(e) => setAppContent(e.target.value)}
          rows={22}
          placeholder="Paste or write the draft funding application text (Markdown formatted)..."
          style={{
            width: '100%',
            flex: 1,
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.84rem',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.5,
            resize: 'vertical',
          }}
        />

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          * Saving changes automatically snapshots a new application version and flags the current assessment as <strong>Stale</strong>.
        </div>
      </div>

      {/* Grant Guideline Editor Pane */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-recommended">Grant Guideline Document</span>
              <span className="badge badge-fulfilled">Version v{guideline?.version || 1}</span>
            </div>
            <input
              type="text"
              value={guideTitle}
              onChange={(e) => setGuideTitle(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px dashed var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontWeight: 700,
                marginTop: '6px',
                width: '100%',
                padding: '4px 0',
              }}
            />
          </div>

          <button
            onClick={handleSaveGuide}
            disabled={savingGuide}
            className={`btn btn-sm ${guideSuccess ? 'btn-success' : 'btn-secondary'}`}
          >
            {guideSuccess ? <Check size={14} /> : <Save size={14} />}
            {savingGuide ? 'Saving...' : guideSuccess ? 'Version Saved!' : 'Save (Bump v' + ((guideline?.version || 1) + 1) + ')'}
          </button>
        </div>

        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)' }}>
          <Hash size={12} /> SHA-256: {guideline?.hash ? guideline.hash.substring(0, 16) + '...' : 'pending'}
        </div>

        <textarea
          value={guideContent}
          onChange={(e) => setGuideContent(e.target.value)}
          rows={22}
          placeholder="Paste or write the grant solicitation / funding guideline text..."
          style={{
            width: '100%',
            flex: 1,
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.84rem',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.5,
            resize: 'vertical',
          }}
        />

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          * Modifying guideline requirements will trigger staleness detection and prompt re-mapping against the application.
        </div>
      </div>
    </div>
  );
};
