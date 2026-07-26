from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db import database, models
from ..schemas import schemas

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/student/login", response_model=schemas.StudentResponse)
def student_login(payload: schemas.StudentLogin, db: Session = Depends(database.get_db)):
    usn_clean = payload.usn.strip().upper()
    student = db.query(models.Student).filter(models.Student.usn == usn_clean).first()
    
    if not student:
        # Auto register new student for smooth exam entry if not seeded
        student = models.Student(
            usn=usn_clean,
            name=f"Student ({usn_clean})",
            department="Computer Science & Engineering",
            semester=6
        )
        db.add(student)
        db.commit()
        db.refresh(student)

    return student

@router.post("/teacher/login", response_model=schemas.TeacherResponse)
def teacher_login(payload: schemas.TeacherLogin, db: Session = Depends(database.get_db)):
    teacher = db.query(models.Teacher).filter(models.Teacher.email == payload.email).first()
    
    if not teacher or teacher.password_hash != payload.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    return teacher

@router.get("/students", response_model=list[schemas.StudentResponse])
def get_all_students(db: Session = Depends(database.get_db)):
    return db.query(models.Student).all()
