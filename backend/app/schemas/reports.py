from datetime import datetime
from typing import Optional
from app.schemas.base import BaseSchema


class ReportRequest(BaseSchema):
    incident_id: str
    include_pdf: bool = True
    include_timeline: bool = True


class ReportResponse(BaseSchema):
    id: str
    incident_id: str
    generated_at: datetime
    status: str = "Completed"
    report_url: Optional[str] = None
