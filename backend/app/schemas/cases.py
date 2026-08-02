from typing import Optional
from app.schemas.base import BaseSchema


class CaseCreateSchema(BaseSchema):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "High"


class CaseUpdateSchema(BaseSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None


class CaseResponseSchema(BaseSchema):
    id: str
    caseNumber: str
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    createdBy: str
    createdAt: str
    updatedAt: str
