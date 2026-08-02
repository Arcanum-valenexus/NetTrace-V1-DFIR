from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.dashboard.dashboard_service import DashboardService
from app.schemas.base import ResponseEnvelope

router = APIRouter(prefix="/dashboard", tags=["Operational Dashboard"])


@router.get("/metrics", response_model=ResponseEnvelope[dict], summary="Get Live Security Operational Metrics")
async def get_metrics(db: AsyncSession = Depends(get_db)):
    """Calculates real live security operational metrics from PostgreSQL database."""
    dashboard_service = DashboardService(db)
    metrics = await dashboard_service.get_overview_metrics()
    return ResponseEnvelope(success=True, data=metrics)


@router.get("/kill-chain", response_model=ResponseEnvelope[dict], summary="Get Kill Chain Distribution")
async def get_kill_chain(db: AsyncSession = Depends(get_db)):
    """Queries Kill Chain stage distribution chart data."""
    dashboard_service = DashboardService(db)
    distribution = await dashboard_service.get_kill_chain_distribution()
    return ResponseEnvelope(success=True, data=distribution)
