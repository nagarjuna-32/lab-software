import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Key, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { authApi, Student } from '../services/api';

interface Props {
  onSuccess: (student: Student) => void;
  onTeacherLoginClick: () => void;
}

export const StudentLogin: React.FC<Props> = ({ onSuccess, onTeacherLoginClick }) => {
  const [usn, setUsn] = useState('');
  const [studentInfo, setStudentInfo] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchOrLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usn.trim()) return;

    setLoading(true);
    setError('');

    try {
      const student = await authApi.studentLogin(usn.trim());
      setStudentInfo(student);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to authenticate USN');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = () => {
    if (studentInfo) {
      onSuccess(studentInfo);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.15), transparent 70%), #0b0f19',
      padding: '20px'
    }}>
      <div className="glass-panel-glow" style={{ width: '100%', maxWidth: '460px', padding: '36px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2))',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            marginBottom: '14px'
          }}>
            <ShieldCheck size={32} color="#6366f1" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
            CodeLock
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Secure Programming Examination System
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {!studentInfo ? (
          <form onSubmit={handleFetchOrLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                ENTER YOUR USN (University Seat Number)
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="e.g. 1K021CS001"
                  value={usn}
                  onChange={(e) => setUsn(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1rem',
                    outline: 'none',
                    letterSpacing: '0.05em'
                  }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px' }}>
              {loading ? 'Verifying USN...' : 'Verify USN & Continue'}
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '10px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <UserCheck size={24} color="#10b981" />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{studentInfo.name}</h3>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: '#34d399' }}>USN: {studentInfo.usn}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '6px' }}>
                <div><strong>Department:</strong> {studentInfo.department}</div>
                <div><strong>Semester:</strong> {studentInfo.semester}th Sem</div>
              </div>
            </div>

            <button onClick={handleStartExam} className="btn btn-success" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
              <Sparkles size={18} />
              Start Exam Allocation
            </button>
          </div>
        )}

        {/* Footer link to Teacher Login */}
        <div style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button
            onClick={onTeacherLoginClick}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Faculty Portal Login →
          </button>
        </div>
      </div>
    </div>
  );
};
