import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db import database, models
from ..schemas import schemas
from ..services.executor import run_code

router = APIRouter(prefix="/submissions", tags=["Submissions & Execution"])

@router.post("/run", response_model=schemas.CodeRunResult)
def execute_code_snippet(payload: schemas.CodeRunRequest):
    result = run_code(
        language=payload.language,
        code=payload.code,
        input_data=payload.input_data or ""
    )
    return schemas.CodeRunResult(**result)

@router.post("/submit", response_model=schemas.SubmissionResponse)
def submit_exam_code(payload: schemas.SubmissionCreate, db: Session = Depends(database.get_db)):
    question = db.query(models.Question).filter(models.Question.id == payload.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Evaluate against hidden test cases
    test_cases = []
    if question.hidden_test_cases:
        try:
            test_cases = json.loads(question.hidden_test_cases)
        except Exception:
            pass

    total_cases = len(test_cases) if test_cases else 1
    passed_cases = 0

    if test_cases:
        for tc in test_cases:
            inp = tc.get("input", "")
            exp = tc.get("expected", "").strip()
            res = run_code(payload.language, payload.source_code, inp)
            out = res["stdout"].strip()
            if out == exp:
                passed_cases += 1
        marks = round((passed_cases / total_cases) * 100.0, 2)
    else:
        # Simple sample test run evaluation
        res = run_code(payload.language, payload.source_code, question.sample_input or "")
        out = res["stdout"].strip()
        exp = (question.sample_output or "").strip()
        marks = 100.0 if out == exp else 50.0 if res["status"] == "SUCCESS" else 0.0

    submission = models.Submission(
        student_id=payload.student_id,
        exam_id=payload.exam_id,
        question_id=payload.question_id,
        source_code=payload.source_code,
        language=payload.language,
        marks=marks,
        total_marks=100.0,
        status="evaluated"
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission

@router.get("/student/{student_id}", response_model=List[schemas.SubmissionResponse])
def get_student_submissions(student_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.Submission).filter(models.Submission.student_id == student_id).all()

@router.get("/exam/{exam_id}", response_model=List[schemas.SubmissionResponse])
def get_exam_submissions(exam_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.Submission).filter(models.Submission.exam_id == exam_id).all()
