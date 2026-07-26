import React, { useState } from 'react';
import { StudentLogin } from './components/StudentLogin';
import { TeacherLogin } from './components/TeacherLogin';
import { DiceAnimation } from './components/DiceAnimation';
import { ExamWorkspace } from './components/ExamWorkspace';
import { TeacherDashboard } from './components/TeacherDashboard';
import { Student, Teacher, Question } from './services/api';
import { CheckCircle2, Trophy, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const [view, setView] = useState<
    'student_login' | 'teacher_login' | 'dice_animation' | 'workspace' | 'teacher_dashboard' | 'submitted'
  >('student_login');

  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [activeTeacher, setActiveTeacher] = useState<Teacher | null>(null);
  const [assignedQuestion, setAssignedQuestion] = useState<Question | null>(null);

  return (
    <div>
      {view === 'student_login' && (
        <StudentLogin
          onSuccess={(student) => {
            setActiveStudent(student);
            setView('dice_animation');
          }}
          onTeacherLoginClick={() => setView('teacher_login')}
        />
      )}

      {view === 'teacher_login' && (
        <TeacherLogin
          onSuccess={(teacher) => {
            setActiveTeacher(teacher);
            setView('teacher_dashboard');
          }}
          onBackToStudent={() => setView('student_login')}
        />
      )}

      {view === 'dice_animation' && activeStudent && (
        <DiceAnimation
          student={activeStudent}
          examId={1}
          onProceed={(question) => {
            setAssignedQuestion(question);
            setView('workspace');
          }}
        />
      )}

      {view === 'workspace' && activeStudent && assignedQuestion && (
        <ExamWorkspace
          student={activeStudent}
          question={assignedQuestion}
          examId={1}
          durationMinutes={45}
          onFinished={() => setView('submitted')}
        />
      )}

      {view === 'teacher_dashboard' && activeTeacher && (
        <TeacherDashboard
          teacher={activeTeacher}
          onLogout={() => {
            setActiveTeacher(null);
            setView('student_login');
          }}
        />
      )}

      {view === 'submitted' && (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15), #0b0f19 80%)',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div className="glass-panel-glow" style={{ maxWidth: '480px', width: '100%', padding: '40px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid rgba(16, 185, 129, 0.6)',
              marginBottom: '20px',
              color: '#10b981'
            }}>
              <Trophy size={36} />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              Exam Submitted Successfully!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Your solution source code and hidden test case evaluation records have been saved securely to the CodeLock server database.
            </p>

            <button
              onClick={() => {
                setActiveStudent(null);
                setAssignedQuestion(null);
                setView('student_login');
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px' }}
            >
              Return to Login Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
