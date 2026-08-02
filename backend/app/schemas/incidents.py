from typing import List, Optional
from app.schemas.base import BaseSchema


class IncidentCreateSchema(BaseSchema):
    title: str
    severity: str
    category: str
    assignedAnalyst: str
    summary: Optional[str] = None
    attackVector: Optional[str] = None
    currentStage: Optional[str] = "Initial Access"


class ImpactedAssetSchema(BaseSchema):
    id: str
    hostname: str
    ipAddress: str
    os: str
    macAddress: Optional[str] = None
    assetType: str
    status: str
    owner: str


class TimelineEventSchema(BaseSchema):
    id: str
    incidentId: str
    timestamp: str
    source: str
    eventType: str
    description: str
    severity: str
    rawLog: Optional[str] = None


class AnalystNoteSchema(BaseSchema):
    id: str
    author: str
    timestamp: str
    content: str


class ChecklistTaskSchema(BaseSchema):
    id: str
    task: str
    completed: bool
    assignedTo: Optional[str] = None


class IncidentResponseSchema(BaseSchema):
    id: str
    incidentNumber: str
    title: str
    severity: str
    status: str
    category: str
    assignedAnalyst: str
    createdAt: str
    updatedAt: str
    summary: str
    attackVector: str
    currentStage: str
    impactedAssets: List[ImpactedAssetSchema] = []
    timeline: List[TimelineEventSchema] = []
    mitreTactics: List[dict] = []
    notes: List[AnalystNoteSchema] = []
    containmentChecklist: List[ChecklistTaskSchema] = []
