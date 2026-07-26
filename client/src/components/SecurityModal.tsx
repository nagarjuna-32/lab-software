import React from 'react';
import { AlertTriangle, Lock, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

interface Props {
  violationType: string;
  details: string;
  onDismiss?: () => void;
}

export const SecurityModal: React.FC<Props> = ({ violationType, details }) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      backgroundColor: 'rgba(11, 15, 25, 0.96)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      userSelect: 'none'
    }}>
      <div className="glass-panel-glow" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '36px',
        textAlign: 'center',
        border: '1px solid rgba(239, 68, 68, 0.5)',
        boxShadow: 'var(--shadow-danger)'
      }}>
        {/* Lock / Alert Icon */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          border: '2px solid rgba(239, 68, 68, 0.6)',
          marginBottom: '16px',
          color: '#ef4444'
        }}>
          <Lock size={32} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <span className="badge badge-danger" style={{ marginBottom: '8px' }}>
            <ShieldAlert size={12} /> Security Policy Violation Detected
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            EXAM LOCKED
          </h2>
          <p style={{ color: '#f87171', fontSize: '0.9rem', marginTop: '4px', fontWeight: 500 }}>
            {violationType || 'Application Focus Lost / Alt+Tab Detected'}
          </p>
        </div>

        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '16px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          textAlign: 'left',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
            <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span><strong>Details:</strong> {details || 'You switched windows or exited full-screen mode during the exam session.'}</span>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', marginTop: '8px' }}>
            <span style={{ color: '#38bdf8', fontSize: '0.8rem' }}>
              • An automated alert has been dispatched to the faculty supervisor.
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}>
          <RefreshCw size={16} className="rolling" style={{ animation: 'spin3D 3s linear infinite' }} />
          <span>Waiting for faculty supervisor to review and authorize unlock...</span>
        </div>
      </div>
    </div>
  );
};
