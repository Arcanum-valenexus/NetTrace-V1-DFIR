from typing import Any, Dict, Optional
from app.schemas.base import BaseSchema


class AIThreatAnalysisRequest(BaseSchema):
    context: str
    incident_id: Optional[str] = None


class AIThreatAnalysisResponse(BaseSchema):
    analysis: str
    threat_score: int
    recommended_actions: list[str]
