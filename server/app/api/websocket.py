import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from typing import Dict, List
from ..db import database, models

router = APIRouter(tags=["WebSockets"])

class ConnectionManager:
    def __init__(self):
        # active_connections: exam_id -> list of WebSockets
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # student_connections: student_id -> WebSocket
        self.student_sockets: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, exam_id: int, client_type: str, user_id: int = 0):
        await websocket.accept()
        if exam_id not in self.active_connections:
            self.active_connections[exam_id] = []
        self.active_connections[exam_id].append(websocket)

        if client_type == "student" and user_id:
            self.student_sockets[user_id] = websocket

    def disconnect(self, websocket: WebSocket, exam_id: int, user_id: int = 0):
        if exam_id in self.active_connections and websocket in self.active_connections[exam_id]:
            self.active_connections[exam_id].remove(websocket)
        if user_id in self.student_sockets:
            del self.student_sockets[user_id]

    async def broadcast_to_exam(self, exam_id: int, message: dict):
        if exam_id in self.active_connections:
            for connection in self.active_connections[exam_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

    async def send_to_student(self, student_id: int, message: dict):
        if student_id in self.student_sockets:
            try:
                await self.student_sockets[student_id].send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/ws/exam/{exam_id}")
async def websocket_endpoint(websocket: WebSocket, exam_id: int, client_type: str = "student", user_id: int = 0):
    await manager.connect(websocket, exam_id, client_type, user_id)
    
    # Broadcast connection event
    await manager.broadcast_to_exam(exam_id, {
        "type": "USER_CONNECTED",
        "client_type": client_type,
        "user_id": user_id
    })

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            msg_type = message.get("type")

            if msg_type == "VIOLATION":
                # Save violation log to DB
                db = database.SessionLocal()
                try:
                    log_entry = models.SecurityLog(
                        student_id=message.get("student_id"),
                        exam_id=exam_id,
                        event_type=message.get("event_type", "FOCUS_LOST"),
                        details=message.get("details", "Window focus lost / Alt+Tab detected"),
                        status="FLAGGED"
                    )
                    db.add(log_entry)
                    db.commit()
                finally:
                    db.close()

                # Broadcast security alert to teacher dashboard
                await manager.broadcast_to_exam(exam_id, {
                    "type": "SECURITY_ALERT",
                    "student_id": message.get("student_id"),
                    "student_name": message.get("student_name"),
                    "usn": message.get("usn"),
                    "event_type": message.get("event_type"),
                    "details": message.get("details"),
                    "timestamp": message.get("timestamp")
                })

            elif msg_type == "TEACHER_ACTION":
                # Teacher decided to approve/resume or terminate student exam
                target_student_id = message.get("student_id")
                action = message.get("action")  # "RESUME" or "TERMINATE"

                db = database.SessionLocal()
                try:
                    logs = db.query(models.SecurityLog).filter(
                        models.SecurityLog.student_id == target_student_id,
                        models.SecurityLog.exam_id == exam_id,
                        models.SecurityLog.status == "FLAGGED"
                    ).all()
                    for log in logs:
                        log.status = "APPROVED" if action == "RESUME" else "DISQUALIFIED"
                    db.commit()
                finally:
                    db.close()

                # Notify student client directly
                await manager.send_to_student(target_student_id, {
                    "type": "EXAM_DECISION",
                    "action": action,
                    "reason": message.get("reason", "Teacher decision applied")
                })

                # Broadcast update to dashboard
                await manager.broadcast_to_exam(exam_id, {
                    "type": "STUDENT_STATUS_UPDATE",
                    "student_id": target_student_id,
                    "action": action
                })

    except WebSocketDisconnect:
        manager.disconnect(websocket, exam_id, user_id)
        await manager.broadcast_to_exam(exam_id, {
            "type": "USER_DISCONNECTED",
            "client_type": client_type,
            "user_id": user_id
        })
