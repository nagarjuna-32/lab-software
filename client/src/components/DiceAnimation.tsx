import React, { useState, useEffect } from 'react';
import { Dices, Sparkles, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student, Question, examApi } from '../services/api';

interface Props {
  student: Student;
  examId: number;
  onProceed: (question: Question) => void;
}

export const DiceAnimation: React.FC<Props> = ({ student, examId, onProceed }) => {
  const [rolling, setRolling] = useState(true);
  const [assignedQuestion, setAssignedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    // Fetch assigned random question and play dice roll effect
    const fetchQuestion = async () => {
      try {
        const q = await examApi.getRandomQuestion(examId, student.id);
        
        // Hold dice rolling animation for 2 seconds
        setTimeout(() => {
          setAssignedQuestion(q);
          setRolling(false);
          // Trigger confetti burst on assignment reveal
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
          });
        }, 2000);
      } catch (err) {
        console.error('Failed to get random question', err);
      }
    };

    fetchQuestion();
  }, [examId, student.id]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.2), #0b0f19 80%)',
      padding: '20px'
    }}>
      <div className="glass-panel-glow" style={{ width: '100%', maxWidth: '520px', padding: '40px', textAlign: 'center' }}>
        
        <div style={{ marginBottom: '24px' }}>
          <span className="badge badge-success" style={{ marginBottom: '12px' }}>
            <Sparkles size={12} /> Live Exam Allocation
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
            Random Question Assignment
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Allocating a unique problem from the question bank for {student.name}
          </p>
        </div>

        {/* Dice Animation Area */}
        <div style={{
          height: '160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '30px 0'
        }}>
          {rolling ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div className="dice-container">
                <div className="dice-cube rolling" style={{
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-glow)'
                }}>
                  <Dices size={54} color="#ffffff" />
                </div>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>
                🎲 Rolling dice & selecting question...
              </p>
            </div>
          ) : assignedQuestion && (
            <div style={{
              width: '100%',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid var(--border-highlight)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'left',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-success">
                  <CheckCircle2 size={12} /> Assigned Problem #{assignedQuestion.id}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {assignedQuestion.difficulty}
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                {assignedQuestion.title}
              </h3>
              <p style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                lineHeight: 1.4,
                maxHeight: '60px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {assignedQuestion.description}
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        {!rolling && assignedQuestion && (
          <button
            onClick={() => onProceed(assignedQuestion)}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '10px' }}
          >
            <BookOpen size={18} />
            Enter Coding Workspace
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
