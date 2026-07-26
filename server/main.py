from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import database, models
from app.api import auth, exams, questions, submissions, websocket
from app.services.seed import seed_database

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

# Seed database with initial sample data
db = database.SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

app = FastAPI(
    title="CodeLock API",
    description="Secure Programming Lab Examination System Backend",
    version="1.0.0"
)

# Enable CORS for Electron / React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(exams.router)
app.include_router(questions.router)
app.include_router(submissions.router)
app.include_router(websocket.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "CodeLock - Secure Examination Engine",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
