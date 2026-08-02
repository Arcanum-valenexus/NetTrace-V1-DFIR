from typing import List, Optional
from app.schemas.base import BaseSchema


class ChainOfCustodyEntrySchema(BaseSchema):
    id: str
    evidenceId: Optional[str] = None
    caseId: Optional[str] = None
    action: str
    actor: str
    timestamp: str
    notes: str


class EvidenceArtifactResponse(BaseSchema):
    id: str
    caseId: str
    incidentId: str
    name: str
    category: str
    description: Optional[str] = None
    tags: List[str] = []
    sizeBytes: int
    hashSha256: str
    hashMd5: str
    uploadedAt: str
    uploadedBy: str
    ownerInvestigatorId: Optional[str] = None
    ownerInvestigatorName: Optional[str] = None
    storagePath: str
    chainOfCustody: List[ChainOfCustodyEntrySchema] = []
