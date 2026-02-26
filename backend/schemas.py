from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum

class PriorityEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: PriorityEnum = PriorityEnum.MEDIUM
    sync_with_calendar: bool = True

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[PriorityEnum] = None
    is_completed: Optional[bool] = None
    sync_with_calendar: Optional[bool] = None

class Task(TaskBase):
    id: int
    is_completed: bool
    created_at: datetime
    google_event_id: Optional[str] = None

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
