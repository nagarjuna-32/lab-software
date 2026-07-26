from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from .database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    usn = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, default="Computer Science & Engineering")
    semester = Column(Integer, default=6)
    password_hash = Column(String, nullable=True)

    submissions = relationship("Submission", back_populates="student")
    logs = relationship("SecurityLog", back_populates="student")

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    exams = relationship("Exam", back_populates="created_by_teacher")

class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    duration = Column(Integer, nullable=False)  # in minutes
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    status = Column(String, default="active")  # draft, active, completed
    created_by = Column(Integer, ForeignKey("teachers.id"))
    language = Column(String, default="python")  # python, c, cpp, java

    created_by_teacher = relationship("Teacher", back_populates="exams")
    questions = relationship("Question", back_populates="exam")
    submissions = relationship("Submission", back_populates="exam")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=True)
    title = Column(String, nullable=False)
    language = Column(String, default="python")
    description = Column(Text, nullable=False)
    sample_input = Column(Text, nullable=True)
    sample_output = Column(Text, nullable=True)
    hidden_test_cases = Column(Text, nullable=True)  # JSON array string of test cases [{"input": "...", "expected": "..."}]
    difficulty = Column(String, default="Medium")

    exam = relationship("Exam", back_populates="questions")
    submissions = relationship("Submission", back_populates="question")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    source_code = Column(Text, nullable=False)
    language = Column(String, default="python")
    marks = Column(Float, default=0.0)
    total_marks = Column(Float, default=100.0)
    status = Column(String, default="submitted")  # submitted, evaluated
    submitted_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="submissions")
    exam = relationship("Exam", back_populates="submissions")
    question = relationship("Question", back_populates="submissions")

class SecurityLog(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=True)
    event_type = Column(String, nullable=False)  # ALT_TAB, FOCUS_LOST, FULLSCREEN_EXIT, PROCESS_VIOLATION
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(Text, nullable=True)
    status = Column(String, default="FLAGGED")  # FLAGGED, APPROVED, DISQUALIFIED

    student = relationship("Student", back_populates="logs")
