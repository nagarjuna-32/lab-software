# CodeLock – Secure Programming Lab Examination System

**Tagline:** *A secure coding environment for fair and independent programming examinations.*

---

## 🌟 Overview & Key Features

CodeLock is an enterprise-grade secure desktop examination environment built to ensure fair, supervised programming assessments.

- **Module 1: Authentication**: Student login using USN (with auto-registration & profile fetching) and Faculty Supervisor Login portal.
- **Module 2: Exam Creation**: Faculty can create new exams, set duration, select programming languages, and publish sessions.
- **Module 3: Random Question Selection**: 🎲 3D Dice roll animation on student login assigning unique random problems from the question bank.
- **Module 4: Coding Workspace**: Monaco Editor (VS Code engine) with syntax highlighting, line numbers, auto indentation, and dark theme.
- **Module 5: Code Execution**: Multi-language backend compiler & runner supporting 11 languages (Python, C, C++, Java, JS, TS, Go, Rust, PHP, Ruby, C#) with stdin input, output, stderr, and compilation diagnostics.
- **Module 6: Auto Save**: Automatic client-side local save state every 5 seconds with status indicators.
- **Module 7: Security System & Interlock**: Window focus loss, Alt+Tab app switching, and screen blur detection triggering a full-screen locked state (`SecurityModal`), sending real-time alerts via WebSockets to the faculty dashboard for approval or termination.
- **Module 8: Teacher Dashboard**: Live student roster, real-time security alert stream, single-click approve/end controls, exam manager, and submissions view.
- **Module 9: Submission Engine**: Hidden test case execution & automated score calculation.
- **Module 10: Reports & Analytics**: Detailed marks and evaluation records per student submission.

---

## 🚀 How to Run Locally

### 1. Start FastAPI Backend Server
```bash
cd server
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start Frontend App (React + Vite)
```bash
cd client
npm install
cmd /c npm run dev
```

---

## 📊 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/student/login` | Student login / auto-register by USN |
| `POST` | `/auth/teacher/login` | Faculty supervisor login |
| `GET`  | `/exams/active` | Retrieve current active exam session |
| `GET`  | `/exams/{id}/random-question/{student_id}` | Assign deterministic random question |
| `POST` | `/submissions/run` | Execute code snippet against custom input |
| `POST` | `/submissions/submit` | Evaluate code against hidden test cases & grade |
| `WS`   | `/ws/exam/{exam_id}` | Real-time WebSocket security alert broadcast channel |

---

## 🛠️ Supported Language Matrix

| Language | Ext | Runtime / Compiler | Monaco Syntax |
|----------|-----|--------------------|---------------|
| Python 3 | `.py` | `python` | `python` |
| C | `.c` | `gcc` | `cpp` |
| C++ | `.cpp` | `g++` | `cpp` |
| Java 17 | `.java` | `javac` / `java` | `java` |
| JavaScript | `.js` | `Node.js` | `javascript` |
| TypeScript | `.ts` | `ts-node` | `typescript` |
| Go | `.go` | `go run` | `go` |
| Rust | `.rs` | `rustc` | `rust` |
| PHP | `.php` | `php` | `php` |
| Ruby | `.rb` | `ruby` | `ruby` |
| C# | `.cs` | `csc` | `csharp` |

---

## 🔑 Demo Credentials
- **Student USN**: Enter any USN (e.g. `1K021CS001`, `1K021CS002`).
- **Teacher Login**:
  - Email: `teacher@codelock.edu`
  - Password: `admin123`
