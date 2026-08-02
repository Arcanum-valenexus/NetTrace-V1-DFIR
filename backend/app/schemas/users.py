from typing import List, Optional
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
    created_at: str


class UserSessionResponse(BaseSchema):
    id: str
    browser: str
    device: str
    operatingSystem: str
    ipAddress: str
    location: str
    loginTime: str
    lastActive: str
    isCurrent: bool


class UserActivityResponse(BaseSchema):
    id: str
    action: str
    timestamp: str
    ipAddress: str
    details: str


class UserProfileResponse(BaseSchema):
    id: str
    fullName: str
    email: EmailStr
    phone: str
    organization: str
    role: str
    avatarUrl: Optional[str] = None
    experienceLevel: str
    certifications: List[str]
    skills: List[str]
    isTwoFactorEnabled: bool
    recoveryCodes: List[str]
    isEmailVerified: bool
    sessions: List[UserSessionResponse]
    activityLog: List[UserActivityResponse]
