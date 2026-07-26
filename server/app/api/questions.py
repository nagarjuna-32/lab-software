from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db import database, models
from ..schemas import schemas

router = APIRouter(prefix="/questions", tags=["Questions"])

@router.get("/", response_model=List[schemas.QuestionResponse])
def get_all_questions(db: Session = Depends(database.get_db)):
    return db.query(models.Question).all()

@router.post("/", response_model=schemas.QuestionResponse)
def create_question(payload: schemas.QuestionCreate, db: Session = Depends(database.get_db)):
    q = models.Question(**payload.model_dump())
    db.add(q)
    db.commit()
    db.refresh(q)
    return q

@router.get("/{question_id}", response_model=schemas.QuestionResponse)
def get_question(question_id: int, db: Session = Depends(database.get_db)):
    q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return q
