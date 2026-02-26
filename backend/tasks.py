from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from database import get_db
from models import Task, User
from schemas import TaskCreate, TaskUpdate, Task as TaskSchema
from auth import get_current_user
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import os

router = APIRouter(prefix="/tasks", tags=["tasks"])

def get_calendar_service(user: User):
    if not user.refresh_token:
        return None
    
    creds = Credentials(
        None,
        refresh_token=user.refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET")
    )
    return build('calendar', 'v3', credentials=creds)

@router.post("/", response_model=TaskSchema)
async def create_task(task_in: TaskCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = Task(**task_in.dict(), user_id=current_user.id)
    db.add(task)
    await db.commit()
    await db.refresh(task)
    
    # Sync with Google Calendar if enabled
    if task.sync_with_calendar and task.due_date:
        service = get_calendar_service(current_user)
        if service:
            event = {
                'summary': task.title,
                'description': task.description,
                'start': {
                    'dateTime': task.due_date.isoformat(),
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': (task.due_date).isoformat(), # Default to same time for now
                    'timeZone': 'UTC',
                },
            }
            try:
                created_event = service.events().insert(calendarId='primary', body=event).execute()
                task.google_event_id = created_event.get('id')
                await db.commit()
            except Exception as e:
                print(f"Error syncing to calendar: {e}")
                
    return task

@router.get("/", response_model=List[TaskSchema])
async def read_tasks(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Task).where(Task.user_id == current_user.id))
    return result.scalars().all()

@router.put("/{task_id}", response_model=TaskSchema)
async def update_task(task_id: int, task_in: TaskUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Task).where(Task.id == task_id, Task.user_id == current_user.id))
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    await db.commit()
    await db.refresh(task)
    
    # Sync update to Google Calendar
    if task.google_event_id:
        service = get_calendar_service(current_user)
        if service:
            event = {
                'summary': task.title,
                'description': task.description,
                'start': {
                    'dateTime': task.due_date.isoformat() if task.due_date else None,
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': task.due_date.isoformat() if task.due_date else None,
                    'timeZone': 'UTC',
                },
                'status': 'confirmed' if not task.is_completed else 'cancelled' # Or just update description
            }
            try:
                service.events().patch(calendarId='primary', eventId=task.google_event_id, body=event).execute()
            except Exception as e:
                print(f"Error updating calendar: {e}")
                
    return task

@router.delete("/{task_id}")
async def delete_task(task_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Task).where(Task.id == task_id, Task.user_id == current_user.id))
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Delete from Google Calendar
    if task.google_event_id:
        service = get_calendar_service(current_user)
        if service:
            try:
                service.events().delete(calendarId='primary', eventId=task.google_event_id).execute()
            except Exception as e:
                print(f"Error deleting from calendar: {e}")
                
    await db.delete(task)
    await db.commit()
    return {"status": "success"}
