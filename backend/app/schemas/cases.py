from datetime import datetime
from typing import Optional
from app.schemas.base import BaseSchema


class CaseBase(BaseSchema):
    case_number: str
    title: str
    description: Optional[str] = None
    status: str = "Active"
    priority: str = "High"


class CaseCreate(CaseBase):
    pass


class CaseResponse(CaseBase):
    id: str
    created_at: datetime
