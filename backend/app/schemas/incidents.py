from datetime import datetime
from typing import Optional
from app.schemas.base import BaseSchema


class IncidentBase(BaseSchema):
    incident_number: str
    title: str
    severity: str = "Critical"
    status: str = "Investigating"
    category: str = "Ransomware"
    assigned_analyst: str
    summary: Optional[str] = None
    attack_vector: Optional[str] = None
    current_stage: Optional[str] = "Impact"


class IncidentCreate(IncidentBase):
    pass


class IncidentResponse(IncidentBase):
    id: str
    created_at: datetime
