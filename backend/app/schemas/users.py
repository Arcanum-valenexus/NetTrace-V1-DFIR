from datetime import datetime
from typing import Optional
from pydantic import EmailStr
from app.schemas.base import BaseSchema


class UserBase(BaseSchema):
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "Lead DFIR Investigator"


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: str
    created_at: datetime
