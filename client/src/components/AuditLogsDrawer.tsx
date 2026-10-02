import React from 'react';
import { AuditLog } from '../types';
import { X, Activity, User, Bot, Server, Clock, ChevronRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLog[];
}

export const AuditLogsDrawer: React.FC<Props> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        className="glass-panel-elevated"
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100vh',
          borderRadius: '0',
          borderLeft: '1px solid var(--border-medium)',
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInUp 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '8px', borderRadius: '8px', display: 'flex' }}>
              <Activity size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Audit Trail & Trace Logs</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Immutable event stream of human overrides & AI actions
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          {logs.map((log) => {
            let ActorIcon = Server;
            let actorColor = '#64748b';
            let actorBadge = 'badge-secondary';

            if (log.actor === 'HUMAN_USER') {
              ActorIcon = User;
              actorColor = '#38bdf8';
              actorBadge = 'badge-cyan';
            } else if (log.actor === 'AI_AGENT') {
              ActorIcon = Bot;
              actorColor = '#818cf8';
              actorBadge = 'badge-recommended';
            }

            let parsedDetails: any = {};
            try {
              parsedDetails = JSON.parse(log.details_json);
            } catch (e) {}

            return (
              <div
                key={log.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ActorIcon size={14} style={{ color: actorColor }} />
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: actorColor }}>
                      {log.actor}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} /> {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>

                <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {log.action_type.replace(/_/g, ' ')}
                </div>

                <pre
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {JSON.stringify(parsedDetails, null, 2)}
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
