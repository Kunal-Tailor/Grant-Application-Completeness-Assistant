import React, { useState } from 'react';
import { ClarificationQuestion } from '../types';
import { HelpCircle, CheckCircle, Send, MessageSquare, AlertCircle } from 'lucide-react';

interface Props {
  questions: ClarificationQuestion[];
  onAnswerQuestion: (questionId: string, answer: string) => Promise<void>;
}

export const ClarificationQuestionsView: React.FC<Props> = ({ questions, onAnswerQuestion }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const openCount = questions.filter((q) => q.status === 'open').length;

  const handleSaveAnswer = async (qId: string) => {
    const text = answers[qId] || '';
    if (!text.trim()) return;

    setSavingId(qId);
    try {
      await onAnswerQuestion(qId, text);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} style={{ color: '#818cf8' }} />
            Applicant Clarification Questions
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Targeted AI-formulated questions addressing ambiguous metrics, vague methodology, or missing operational detail.
          </p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            background: openCount > 0 ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: openCount > 0 ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
            color: openCount > 0 ? '#a5b4fc' : '#34d399',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}
        >
          {openCount > 0 ? (
            <>
              <AlertCircle size={15} />
              {openCount} Open Clarification Query{openCount > 1 ? 's' : ''}
            </>
          ) : (
            <>
              <CheckCircle size={15} />
              All Clarifications Addressed
            </>
          )}
        </div>
      </div>

      {questions.length === 0 ? (
        <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CheckCircle size={40} style={{ margin: '0 auto 12px', color: '#10b981', opacity: 0.8 }} />
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No Ambiguities Detected</div>
          <div style={{ fontSize: '0.82rem' }}>All evaluated sections provide clear, unambiguous details.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {questions.map((q) => {
            const isResolved = q.status === 'resolved';
            let prioBadge = 'badge-missing';
            if (q.priority === 'high') prioBadge = 'badge-partial';
            else if (q.priority === 'medium') prioBadge = 'badge-cyan';

            const currentAnswer = answers[q.id] !== undefined ? answers[q.id] : (q.applicant_response || '');

            return (
              <div
                key={q.id}
                style={{
                  background: isResolved ? 'rgba(255, 255, 255, 0.02)' : 'rgba(99, 102, 241, 0.04)',
                  border: isResolved ? '1px solid var(--border-subtle)' : '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '18px 20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className={`badge ${prioBadge}`}>
                    {q.priority.toUpperCase()} PRIORITY
                  </span>
                  {q.context_hint && (
                    <span className="badge badge-cyan">{q.context_hint}</span>
                  )}
                  {isResolved && (
                    <span className="badge badge-fulfilled">
                      <CheckCircle size={12} /> Addressed
                    </span>
                  )}
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
                  {q.question}
                </div>

                {/* Response Box */}
                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Applicant Draft Clarification Response:
                  </label>
                  <textarea
                    rows={2}
                    value={currentAnswer}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    placeholder="Enter clarification to incorporate into the draft application..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.84rem',
                      fontFamily: 'var(--font-sans)',
                      marginBottom: '8px',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleSaveAnswer(q.id)}
                      disabled={savingId === q.id || !currentAnswer.trim()}
                      className="btn btn-sm btn-primary"
                    >
                      <Send size={13} />
                      {savingId === q.id ? 'Saving...' : 'Record Clarification'}
                    </button>
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
