from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Student Schemas
class StudentLogin(BaseModel):
    usn: str

class StudentCreate(BaseModel):
    usn: str
    name: str
    department: Optional[str] = "Computer Science & Engineering"
    semester: Optional[int] = 6

class StudentResponse(BaseModel):
    id: int
    usn: str
    name: str
    department: str
    semester: int

    class Config:
        from_attributes = True

# Teacher Schemas
class TeacherLogin(BaseModel):
    email: str
    password: str

class TeacherResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

# Question Schemas
class QuestionBase(BaseModel):
    title: str
    language: str = "python"
    description: str
    sample_input: Optional[str] = ""
    sample_output: Optional[str] = ""
    hidden_test_cases: Optional[str] = "[]"
    difficulty: Optional[str] = "Medium"

class QuestionCreate(QuestionBase):
    exam_id: Optional[int] = None

class QuestionResponse(QuestionBase):
    id: int
    exam_id: Optional[int] = None

    class Config:
        from_attributes = True

# Exam Schemas
class ExamCreate(BaseModel):
    title: str
    duration: int
    language: str = "python"

class ExamResponse(BaseModel):
    id: int
    title: str
    duration: int
    status: str
    language: str
    questions: List[QuestionResponse] = []

    class Config:
        from_attributes = True

# Code Execution & Submission
class CodeRunRequest(BaseModel):
    language: str
    code: str
    input_data: Optional[str] = ""

class CodeRunResult(BaseModel):
    stdout: str
    stderr: str
    status: str  # SUCCESS, COMPILE_ERROR, RUNTIME_ERROR, TIMEOUT

class SubmissionCreate(BaseModel):
    student_id: int
    exam_id: int
    question_id: int
    source_code: str
    language: str

class SubmissionResponse(BaseModel):
    id: int
    student_id: int
    exam_id: int
    question_id: int
    marks: float
    total_marks: float
    status: str
    submitted_at: datetime

    class Config:
        from_attributes = True

# Security Alert / Violation
class ViolationReport(BaseModel):
    student_id: int
    exam_id: int
    event_type: str
    details: Optional[str] = ""
