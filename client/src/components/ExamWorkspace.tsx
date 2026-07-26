import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, Send, Clock, Save, ShieldCheck, Terminal, AlertCircle, CheckCircle2, FileCode2, User
} from 'lucide-react';
import { Student, Question, submissionApi } from '../services/api';
import { SecurityModal } from './SecurityModal';

interface Props {
  student: Student;
  question: Question;
  examId: number;
  durationMinutes: number;
  onFinished: () => void;
}

export const ExamWorkspace: React.FC<Props> = ({
  student,
  question,
  examId,
  durationMinutes,
  onFinished
}) => {
  const defaultTemplates: Record<string, string> = {
    python: `# Python 3 - CodeLock Solution\nimport sys\n\ndef main():\n    lines = sys.stdin.read().splitlines()\n    if not lines:\n        return\n    # Write your solution logic here\n    # print(result)\n\nif __name__ == '__main__':\n    main()\n`,
    c: `// C - CodeLock Solution\n#include <stdio.init>\n#include <stdio.h>\n\nint main() {\n    // Write your C solution here\n    return 0;\n}\n`,
    cpp: `// C++ - CodeLock Solution\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ solution here\n    return 0;\n}\n`,
    java: `// Java - CodeLock Solution\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        // Write your Java solution here\n    }\n}\n`
  };

  const [language, setLanguage] = useState<string>(question.language || 'python');
  const [code, setCode] = useState<string>(() => {
    const saved = localStorage.getItem(`codelock_save_${student.id}_${question.id}`);
    return saved || defaultTemplates[question.language || 'python'] || defaultTemplates['python'];
  });

  // Consoles & Outputs
  const [customInput, setCustomInput] = useState<string>(question.sample_input || '');
  const [consoleTab, setConsoleTab] = useState<'output' | 'input' | 'results'>('output');
  const [stdout, setStdout] = useState<string>('');
  const [stderr, setStderr] = useState<string>('');
  const [executionStatus, setExecutionStatus] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto-save state
  const [lastSaved, setLastSaved] = useState<string>('Saved');

  // Exam Timer state
  const [timeLeft, setTimeLeft] = useState<number>(durationMinutes * 60);

  // Security Interlock State
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [violationDetails, setViolationDetails] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);

  // 1. Exam Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onFinished();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onFinished]);

  // 2. Auto-save every 5 seconds (Module 6)
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (code) {
        localStorage.setItem(`codelock_save_${student.id}_${question.id}`, code);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSaved(`Saved at ${timeStr}`);
      }
    }, 5000);
    return () => clearInterval(saveInterval);
  }, [code, student.id, question.id]);

  // 3. Security Focus & Blur Event Listeners & WebSockets (Module 7)
  useEffect(() => {
    // Establish WebSocket connection to backend
    const wsUrl = `ws://localhost:8000/ws/exam/${examId}?client_type=student&user_id=${student.id}`;
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'EXAM_DECISION') {
          if (msg.action === 'RESUME') {
            setIsLocked(false);
          } else if (msg.action === 'TERMINATE') {
            alert('Your exam session has been terminated by the faculty supervisor.');
            onFinished();
          }
        }
      } catch (err) {
        console.error('WS Error:', err);
      }
    };

    // Trigger security lock on window blur / tab switch
    const handleBlur = () => {
      const details = 'Window focus lost / Alt+Tab app switch detected.';
      setViolationDetails(details);
      setIsLocked(true);

      // Report violation over WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'VIOLATION',
          student_id: student.id,
          student_name: student.name,
          usn: student.usn,
          event_type: 'FOCUS_LOST',
          details,
          timestamp: new Date().toISOString()
        }));
      }
    };

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
      if (socket) socket.close();
    };
  }, [examId, student.id, student.name, student.usn, onFinished]);

  // Format timer MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Run Code logic (Module 5)
  const handleRunCode = async () => {
    setIsRunning(true);
    setConsoleTab('output');
    setExecutionStatus('Compiling and executing...');
    setStdout('');
    setStderr('');

    try {
      const result = await submissionApi.runCode(language, code, customInput);
      setStdout(result.stdout || '');
      setStderr(result.stderr || '');
      setExecutionStatus(result.status);
    } catch (err: any) {
      setStderr(err.response?.data?.detail || 'Execution service error.');
      setExecutionStatus('ERROR');
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Code logic (Module 9)
  const handleSubmitCode = async () => {
    if (!confirm('Are you sure you want to submit your final code?')) return;
    setIsSubmitting(true);

    try {
      await submissionApi.submitCode(student.id, examId, question.id, code, language);
      alert('Code successfully evaluated and submitted!');
      onFinished();
    } catch (err: any) {
      alert('Submission failed: ' + (err.response?.data?.detail || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0b0f19' }}>
      {/* Security Lock Screen Modal */}
      {isLocked && (
        <SecurityModal
          violationType="Window Focus Lost / Alt+Tab Detected"
          details={violationDetails}
        />
      )}

      {/* Top Navigation / Header */}
      <header style={{
        height: '56px',
        backgroundColor: '#111827',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 10
      }}>
        {/* Title & Language */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCode2 size={22} color="#6366f1" />
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>CodeLock</span>
          </div>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Language:</label>
            <select
              value={language}
              onChange={(e) => {
                const lang = e.target.value;
                setLanguage(lang);
                setCode(defaultTemplates[lang] || '');
              }}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                color: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.85rem',
                outline: 'none',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <option value="python">Python 3</option>
              <option value="c">C (GCC)</option>
              <option value="cpp">C++ (G++)</option>
              <option value="java">Java 17</option>
            </select>
          </div>
        </div>

        {/* Center: Real-time Exam Timer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: timeLeft < 300 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(15, 23, 42, 0.8)',
          border: `1px solid ${timeLeft < 300 ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)'}`,
          padding: '6px 16px',
          borderRadius: '20px',
          color: timeLeft < 300 ? '#f87171' : '#ffffff',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          fontSize: '1rem'
        }}>
          <Clock size={16} />
          <span>{formatTime(timeLeft)}</span>
        </div>

        {/* Right Info & Auto Save Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Save size={14} color="#10b981" />
            <span>{lastSaved}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px' }}>
            <User size={14} color="#6366f1" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{student.usn}</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Split Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Side: Question Pane */}
        <div style={{
          width: '38%',
          borderRight: '1px solid var(--border-color)',
          backgroundColor: '#0f172a',
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="badge badge-success">
                <ShieldCheck size={12} /> {question.difficulty}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                QID #{question.id}
              </span>
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff' }}>
              {question.title}
            </h2>
          </div>

          <div style={{
            fontSize: '0.9rem',
            lineHeight: 1.6,
            color: '#cbd5e1',
            whiteSpace: 'pre-line'
          }}>
            {question.description}
          </div>

          {/* Sample Input/Output Cards */}
          {question.sample_input && (
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                SAMPLE INPUT
              </h4>
              <pre style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                color: '#38bdf8'
              }}>
                {question.sample_input}
              </pre>
            </div>
          )}

          {question.sample_output && (
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                SAMPLE OUTPUT
              </h4>
              <pre style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                color: '#34d399'
              }}>
                {question.sample_output}
              </pre>
            </div>
          )}
        </div>

        {/* Right Side: Monaco Editor & Output Console */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0b0f19' }}>
          
          {/* Monaco Editor Component (Module 4) */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Editor
              height="100%"
              language={language === 'c' || language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                lineNumbers: 'on',
                minimap: { enabled: false },
                autoIndent: 'full',
                formatOnType: true,
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                tabSize: 4
              }}
            />
          </div>

          {/* Bottom Console Tabs & Output Area */}
          <div style={{
            height: '220px',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: '#0f172a',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Console Header Tabs */}
            <div style={{
              height: '36px',
              backgroundColor: '#111827',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px'
            }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setConsoleTab('output')}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: consoleTab === 'output' ? 'rgba(255,255,255,0.08)' : 'none',
                    border: 'none',
                    color: consoleTab === 'output' ? '#ffffff' : 'var(--text-muted)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Terminal size={14} /> Output Console
                </button>

                <button
                  onClick={() => setConsoleTab('input')}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: consoleTab === 'input' ? 'rgba(255,255,255,0.08)' : 'none',
                    border: 'none',
                    color: consoleTab === 'input' ? '#ffffff' : 'var(--text-muted)',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Custom Test Input
                </button>
              </div>

              {/* Status Indicator */}
              {executionStatus && (
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: executionStatus === 'SUCCESS' ? '#34d399' : '#f87171' }}>
                  Status: {executionStatus}
                </span>
              )}
            </div>

            {/* Console Content Body */}
            <div style={{ flex: 1, padding: '12px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
              {consoleTab === 'output' && (
                <div>
                  {isRunning ? (
                    <div style={{ color: 'var(--accent-cyan)' }}>⏳ Executing code on server...</div>
                  ) : stderr ? (
                    <pre style={{ color: '#f87171', whiteSpace: 'pre-wrap' }}>{stderr}</pre>
                  ) : stdout ? (
                    <pre style={{ color: '#34d399', whiteSpace: 'pre-wrap' }}>{stdout}</pre>
                  ) : (
                    <div style={{ color: 'var(--text-dim)' }}>Click 'Run Code' to test your solution.</div>
                  )}
                </div>
              )}

              {consoleTab === 'input' && (
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter custom input data for stdin..."
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    color: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              )}
            </div>

            {/* Action Bar (Run / Submit) */}
            <div style={{
              height: '48px',
              borderTop: '1px solid var(--border-color)',
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              backgroundColor: '#111827'
            }}>
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <Play size={16} /> {isRunning ? 'Running...' : 'Run Code'}
              </button>

              <button
                onClick={handleSubmitCode}
                disabled={isSubmitting}
                className="btn btn-success"
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
              >
                <Send size={16} /> {isSubmitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
