import json
from sqlalchemy.orm import Session
from ..db import models

def seed_database(db: Session):
    # Check if teachers already exist
    if db.query(models.Teacher).first():
        return

    print("Seeding initial database content...")

    # Create default teacher
    teacher = models.Teacher(
        name="Dr. Alan Turing",
        email="teacher@codelock.edu",
        password_hash="admin123"  # simplified for demo
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    # Create sample students
    students_data = [
        {"usn": "1K021CS001", "name": "Aarav Sharma", "department": "CSE", "semester": 6},
        {"usn": "1K021CS002", "name": "Ananya Rao", "department": "CSE", "semester": 6},
        {"usn": "1K021CS003", "name": "Bhavya Patel", "department": "CSE", "semester": 6},
        {"usn": "1K021CS004", "name": "Chirag Hegde", "department": "CSE", "semester": 6},
        {"usn": "1K021CS005", "name": "Diya Nair", "department": "CSE", "semester": 6},
    ]

    for s in students_data:
        student = models.Student(
            usn=s["usn"],
            name=s["name"],
            department=s["department"],
            semester=s["semester"]
        )
        db.add(student)

    # Create default exam
    exam = models.Exam(
        title="CS601: Advanced Data Structures & Algorithms Lab Exam",
        duration=45,
        status="active",
        created_by=teacher.id,
        language="python"
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)

    # Create question bank
    questions_data = [
        {
            "exam_id": exam.id,
            "title": "1. Two Sum Target Finder",
            "language": "python",
            "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nInput format: First line contains comma separated numbers. Second line contains the target.\nOutput format: Print space separated indices.",
            "sample_input": "2,7,11,15\n9",
            "sample_output": "0 1",
            "hidden_test_cases": json.dumps([
                {"input": "2,7,11,15\n9", "expected": "0 1"},
                {"input": "3,2,4\n6", "expected": "1 2"},
                {"input": "3,3\n6", "expected": "0 1"}
            ]),
            "difficulty": "Easy"
        },
        {
            "exam_id": exam.id,
            "title": "2. Reverse Words in a Sentence",
            "language": "python",
            "description": "Given an input string `s`, reverse the order of words.\n\nInput format: A single line string `s`.\nOutput format: The reversed sentence string.",
            "sample_input": "the sky is blue",
            "sample_output": "blue is sky the",
            "hidden_test_cases": json.dumps([
                {"input": "the sky is blue", "expected": "blue is sky the"},
                {"input": "  hello world  ", "expected": "world hello"},
                {"input": "a good   example", "expected": "example good a"}
            ]),
            "difficulty": "Easy"
        },
        {
            "exam_id": exam.id,
            "title": "3. Valid Parentheses Checker",
            "language": "python",
            "description": "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nInput format: String `s`.\nOutput format: `true` or `false`.",
            "sample_input": "()[]{}",
            "sample_output": "true",
            "hidden_test_cases": json.dumps([
                {"input": "()[]{}", "expected": "true"},
                {"input": "(]", "expected": "false"},
                {"input": "([{}])", "expected": "true"}
            ]),
            "difficulty": "Medium"
        },
        {
            "exam_id": exam.id,
            "title": "4. Fibonacci Series Generator",
            "language": "c",
            "description": "Write a program in C/Python to output the first `N` numbers of the Fibonacci sequence.\n\nInput format: Single integer N.\nOutput format: Space separated Fibonacci numbers.",
            "sample_input": "5",
            "sample_output": "0 1 1 2 3",
            "hidden_test_cases": json.dumps([
                {"input": "5", "expected": "0 1 1 2 3"},
                {"input": "8", "expected": "0 1 1 2 3 5 8 13"}
            ]),
            "difficulty": "Easy"
        }
    ]

    for q in questions_data:
        question = models.Question(**q)
        db.add(question)

    db.commit()
    print("Database successfully seeded!")
