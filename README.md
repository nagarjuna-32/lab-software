# CodeLock – Secure Programming Lab Examination System

**Tagline:** *A secure coding environment for fair and independent programming examinations.*

---

## Features Built

- **Module 1: Authentication**: Student login using USN (with auto-registration & profile fetching) and Faculty Supervisor Login portal.
- **Module 2: Exam Creation**: Faculty can create new exams, set duration, select programming languages, and publish sessions.
- **Module 3: Random Question Selection**: 🎲 3D Dice roll animation on student login assigning unique random problems from the question bank.
- **Module 4: Coding Workspace**: Monaco Editor (VS Code engine) with syntax highlighting, line numbers, auto indentation, and dark theme.
- **Module 5: Code Execution**: Multi-language backend compiler & runner supporting Python, C, C++, and Java with stdin input, output, stderr, and compilation diagnostics.
- **Module 6: Auto Save**: Automatic client-side local save state every 5 seconds with status indicators.
- **Module 7: Security System & Interlock**: Window focus loss, Alt+Tab app switching, and screen blur detection triggering a full-screen locked state (`SecurityModal`), sending real-time alerts via WebSockets to the faculty dashboard for approval or termination.
- **Module 8: Teacher Dashboard**: Live student roster, real-time security alert stream, single-click approve/end controls, exam manager, and submissions view.
- **Module 9: Submission Engine**: Hidden test case execution & automated score calculation.
- **Module 10: Reports & Analytics**: Detailed marks and evaluation records per student submission.

---

## How to Run Locally

### 1. Start FastAPI Backend Server
```bash
cd server
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 2. Start Frontend App (React + Vite)
```bash
cd client
npm install
npm run dev
```

### Demo Credentials
- **Student USN**: Enter any USN (e.g. `1K021CS001`, `1K021CS002`, or any custom USN).
- **Teacher Login**:
  - Email: `teacher@codelock.edu`
  - Password: `admin123`
