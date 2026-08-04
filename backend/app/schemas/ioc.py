from typing import List, Optional
from app.schemas.base import BaseSchema


class IOCCreateSchema(BaseSchema):
    type: str
    value: str
    status: str = "Active"
    category: str = "Network Telemetry"
    description: Optional[str] = None
    sourcePacket: Optional[int] = None
    sourceSession: Optional[str] = None
    evidenceId: Optional[str] = None
    incidentId: Optional[str] = None
    caseId: Optional[str] = None
    severity: str = "Medium"
    confidence: float = 0.8


class IOCStatusUpdateSchema(BaseSchema):
    status: str  # Active | Investigating | Whitelisted | Blocked
    notes: Optional[str] = None


class IOCResponseSchema(BaseSchema):
    id: str
    type: str
    value: str
    status: str
    category: str
    description: Optional[str] = None
    sourcePacket: Optional[int] = None
    sourceSession: Optional[str] = None
    evidenceId: Optional[str] = None
    incidentId: Optional[str] = None
    caseId: Optional[str] = None
    severity: str
    confidence: float
    firstSeen: str
    lastSeen: str
    createdAt: str
    updatedAt: str


class IOCListResponseSchema(BaseSchema):
    totalCount: int
    iocs: List[IOCResponseSchema]


class IOCExtractRequestSchema(BaseSchema):
    sessionId: str
    caseId: Optional[str] = None
    incidentId: Optional[str] = None
