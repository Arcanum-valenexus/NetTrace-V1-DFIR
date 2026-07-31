from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class UserSignupSchema(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class IncidentCreateSchema(BaseModel):
    title: str
    severity: str
    category: str
    assignedAnalyst: str
    summary: Optional[str] = None
    attackVector: Optional[str] = None
    currentStage: Optional[str] = "Initial Access"

class TimelineEventCreateSchema(BaseModel):
    incidentId: str
    timestamp: str
    source: str
    eventType: str
    description: str
    severity: Optional[str] = "High"
    rawLog: Optional[str] = None

class ExtractIocRequestSchema(BaseModel):
    raw_text: str

class ReportGenerateRequestSchema(BaseModel):
    incident_id: str
    include_pdf: Optional[bool] = True
