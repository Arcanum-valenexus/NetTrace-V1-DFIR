from typing import Dict
from app.schemas.base import BaseSchema


class DashboardMetricsResponse(BaseSchema):
    active_incidents: int
    critical_alerts: int
    pcaps_analyzed: int
    total_iocs_cataloged: int
    threat_level: str = "Elevated"
