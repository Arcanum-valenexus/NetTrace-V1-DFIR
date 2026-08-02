from app.schemas.base import BaseSchema


class DashboardMetricsResponse(BaseSchema):
    activeIncidents: int
    criticalAlerts: int
    pcapsAnalyzed: int
    totalIocsCataloged: int
    threatLevel: str = "Elevated"
