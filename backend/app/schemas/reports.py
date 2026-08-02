from typing import List, Optional, Dict, Any
from app.schemas.base import BaseSchema


class ReportGenerateRequestSchema(BaseSchema):
    incident_id: str
    case_id: Optional[str] = "CASE-2026-001"
    include_pdf: Optional[bool] = True


class ReportHistoryEntrySchema(BaseSchema):
    id: str
    event: str
    timestamp: str
    actor: str
    notes: Optional[str] = None


class ForensicsReportResponse(BaseSchema):
    id: str
    reportNumber: str
    version: int
    revisionReason: Optional[str] = None
    revisionDate: Optional[str] = None
    incidentId: str
    caseId: str
    incidentTitle: str
    generatedAt: str
    generatedBy: str
    organization: str
    status: str
    reportHash: str
    history: List[ReportHistoryEntrySchema] = []
    coverPage: Dict[str, Any] = {}
    executiveSummary: str = ""
    incidentCaseDetails: Dict[str, Any] = {}
    attackTimeline: List[Dict[str, Any]] = []
    evidenceInventory: List[Dict[str, Any]] = []
    packetAnalysis: Dict[str, Any] = {}
    iocs: List[Dict[str, Any]] = []
    rootCauseAnalysis: Dict[str, Any] = {}
    containmentAndRecovery: Dict[str, Any] = {}
    remediationRecommendations: List[str] = []
    evidenceIntegrity: List[Dict[str, Any]] = []
    chainOfCustodySummary: List[Dict[str, Any]] = []
    investigatorNotes: List[str] = []
    appendix: str = ""
    references: List[str] = []
