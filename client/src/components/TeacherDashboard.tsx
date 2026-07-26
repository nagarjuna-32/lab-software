import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldAlert, CheckCircle, XCircle, Plus, BookOpen, Clock, AlertTriangle, LogOut, RefreshCw
} from 'lucide-react';
import { Teacher, Student, authApi, examApi, submissionApi } from '../services/api';

interface Props {
  teacher: Teacher;
  onLogout: () => void;
}

interface AlertItem {
  student_id: number;
  student_name: string;
  usn: string;
  event_type: string;
  details: string;
  timestamp: string;
}

export const TeacherDashboard: React.FC<Props> = ({ teacher, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'create_exam' | 'submissions'>('monitor');
  const [students, setStudents] = useState<Student[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  // New Exam Form
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamDuration, setNewExamDuration] = useState(60);
  const [newExamLang, setNewExamLang] = useState('python');

  // WebSocket for teacher real-time monitoring
  useEffect(() => {
    // Connect to WebSocket exam stream
    const ws = new WebSocket('ws://localhost:8000/ws/exam/1?client_type=teacher');

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'SECURITY_ALERT') {
          setAlerts((prev) => [msg, ...prev]);
        }
      } catch (err) {
        console.error('WS Error:', err);
      }
    };

    fetchDashboardData();

    return () => {
      ws.close();
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const stList = await authApi.getStudents();
      setStudents(stList);
      const subs = await submissionApi.getExamSubmissions(1);
      setSubmissions(subs);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  };

  const handleTeacherDecision = (studentId: number, action: 'RESUME' | 'TERMINATE') => {
    // Send action over WebSocket
    const ws = new WebSocket('ws://localhost:8000/ws/exam/1?client_type=teacher');
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'TEACHER_ACTION',
        student_id: studentId,
        action,
        reason: action === 'RESUME' ? 'Approved by faculty' : 'Disqualified by faculty'
      }));
      setTimeout(() => ws.close(), 500);
    };

    // Remove alert from list
    setAlerts((prev) => prev.filter((a) => a.student_id !== studentId));
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle) return;

    try {
      await examApi.createExam(newExamTitle, newExamDuration, newExamLang);
      alert('Exam created and published successfully!');
      setNewExamTitle('');
      setActiveTab('monitor');
    } catch (err) {
      alert('Failed to create exam');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0f19', color: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <header style={{
        height: '60px',
        backgroundColor: '#111827',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            fontWeight: 800,
            fontSize: '0.9rem'
          }}>
            FACULTY PORTAL
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 700 }}>CodeLock Dashboard</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Welcome, {teacher.name}</span>
          <button onClick={onLogout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={{
          width: '240px',
          backgroundColor: '#0f172a',
          borderRight: '1px solid var(--border-color)',
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button
            onClick={() => setActiveTab('monitor')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'monitor' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'monitor' ? '#6366f1' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Users size={18} /> Live Exam Monitor
          </button>

          <button
            onClick={() => setActiveTab('create_exam')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'create_exam' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'create_exam' ? '#6366f1' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Plus size={18} /> Create New Exam
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'submissions' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'submissions' ? '#6366f1' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <BookOpen size={18} /> Submissions & Marks
          </button>
        </div>

        {/* View Content */}
        <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          {activeTab === 'monitor' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Live Exam Security Monitor</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Monitoring active exam sessions and real-time security alerts
                  </p>
                </div>
                <button onClick={fetchDashboardData} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  <RefreshCw size={14} /> Refresh Data
                </button>
              </div>

              {/* Active Security Alerts Banner */}
              {alerts.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={20} /> PENDING SECURITY VIOLATION ALERTS ({alerts.length})
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {alerts.map((alertItem, idx) => (
                      <div key={idx} className="glass-panel" style={{
                        padding: '16px',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>{alertItem.student_name}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#f87171' }}>USN: {alertItem.usn}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Violation: <strong>{alertItem.event_type}</strong> - {alertItem.details}
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => handleTeacherDecision(alertItem.student_id, 'RESUME')}
                            className="btn btn-success"
                            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                          >
                            <CheckCircle size={14} /> Approve & Resume
                          </button>

                          <button
                            onClick={() => handleTeacherDecision(alertItem.student_id, 'TERMINATE')}
                            className="btn btn-danger"
                            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                          >
                            <XCircle size={14} /> End Exam
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Student Roster Grid */}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>Enrolled Students Roster</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {students.map((st) => (
                  <div key={st.id} className="glass-panel" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>{st.name}</span>
                      <span className="pulse-dot pulse-dot-green" title="Student Active" />
                    </div>
                    <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '8px' }}>
                      USN: {st.usn}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div>Dept: {st.department}</div>
                      <div>Semester: {st.semester}th Sem</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'create_exam' && (
            <div style={{ maxWidth: '560px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>Create & Publish Exam</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                Configure exam settings, duration, and default programming language.
              </p>

              <form onSubmit={handleCreateExam} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>EXAM TITLE</label>
                  <input
                    type="text"
                    value={newExamTitle}
                    onChange={(e) => setNewExamTitle(e.target.value)}
                    placeholder="e.g. CS601: Algorithm Lab Final Exam"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>DURATION (MINUTES)</label>
                  <input
                    type="number"
                    value={newExamDuration}
                    onChange={(e) => setNewExamDuration(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>DEFAULT LANGUAGE</label>
                  <select
                    value={newExamLang}
                    onChange={(e) => setNewExamLang(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="python">Python 3</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '10px' }}>
                  Publish Exam Session
                </button>
              </form>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>Exam Submissions & Automated Marks</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                Evaluated results based on hidden test case executions
              </p>

              <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '14px 16px' }}>Sub ID</th>
                      <th style={{ padding: '14px 16px' }}>Student ID</th>
                      <th style={{ padding: '14px 16px' }}>Question ID</th>
                      <th style={{ padding: '14px 16px' }}>Language</th>
                      <th style={{ padding: '14px 16px' }}>Marks Score</th>
                      <th style={{ padding: '14px 16px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)' }}>
                          No submissions recorded yet for this exam.
                        </td>
                      </tr>
                    ) : (
                      submissions.map((sub) => (
                        <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)' }}>#{sub.id}</td>
                          <td style={{ padding: '14px 16px' }}>Student #{sub.student_id}</td>
                          <td style={{ padding: '14px 16px' }}>Question #{sub.question_id}</td>
                          <td style={{ padding: '14px 16px', textTransform: 'uppercase' }}>{sub.language}</td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#34d399' }}>{sub.marks} / 100</td>
                          <td style={{ padding: '14px 16px' }}><span className="badge badge-success">{sub.status}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
