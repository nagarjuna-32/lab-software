import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..db import database, models
from ..schemas import schemas

router = APIRouter(prefix="/exams", tags=["Exams"])

@router.get("/", response_model=List[schemas.ExamResponse])
def list_exams(db: Session = Depends(database.get_db)):
    return db.query(models.Exam).all()

@router.get("/active", response_model=schemas.ExamResponse)
def get_active_exam(db: Session = Depends(database.get_db)):
    exam = db.query(models.Exam).filter(models.Exam.status == "active").first()
    if not exam:
        # Create a default active exam if none exists
        teacher = db.query(models.Teacher).first()
        t_id = teacher.id if teacher else 1
        exam = models.Exam(
            title="CS601: Programming Lab Semester Exam",
            duration=60,
            status="active",
            created_by=t_id,
            language="python"
        )
        db.add(exam)
        db.commit()
        db.refresh(exam)
    return exam

@router.post("/create", response_model=schemas.ExamResponse)
def create_exam(payload: schemas.ExamCreate, db: Session = Depends(database.get_db)):
    teacher = db.query(models.Teacher).first()
    t_id = teacher.id if teacher else 1

    new_exam = models.Exam(
        title=payload.title,
        duration=payload.duration,
        language=payload.language,
        status="active",
        created_by=t_id
    )
    db.add(new_exam)
    db.commit()
    db.refresh(new_exam)
    return new_exam

@router.get("/{exam_id}/random-question/{student_id}", response_model=schemas.QuestionResponse)
def assign_random_question(exam_id: int, student_id: int, db: Session = Depends(database.get_db)):
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    questions = db.query(models.Question).filter(models.Question.exam_id == exam_id).all()
    if not questions:
        questions = db.query(models.Question).all()

    if not questions:
        raise HTTPException(status_code=404, detail="No questions available for this exam")

    # Deterministic pseudo-random allocation based on student_id & exam_id so student gets same question on refresh
    seed_val = student_id * 1000 + exam_id
    rng = random.Random(seed_val)
    assigned_q = rng.choice(questions)

    return assigned_q
