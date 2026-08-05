from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user_token
from app.core.security import TokenData
from app.services.dashboard.dashboard_service import DashboardService
from app.schemas.base import ResponseEnvelope

router = APIRouter(prefix="/dashboard", tags=["Operational Dashboard"])


@router.get("/metrics", response_model=ResponseEnvelope[dict], summary="Get Live Security Operational Metrics")
async def get_metrics(
    token_data: TokenData = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db)
):
    """Calculates real live security operational metrics from PostgreSQL database."""
    dashboard_service = DashboardService(db)
    metrics = await dashboard_service.get_overview_metrics(user_id=token_data.sub)
    return ResponseEnvelope(success=True, data=metrics)


@router.get("/pcap-stats", response_model=ResponseEnvelope[dict], summary="Get Live PCAP Forensic Operational Metrics")
async def get_pcap_stats(
    token_data: TokenData = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db)
):
    """Queries live PCAP forensic sessions, total packet counts, top protocols, top talkers, and size statistics."""
    dashboard_service = DashboardService(db)
    stats = await dashboard_service.get_pcap_metrics(user_id=token_data.sub)
    return ResponseEnvelope(success=True, data=stats)


@router.get("/kill-chain", response_model=ResponseEnvelope[dict], summary="Get Kill Chain Distribution")
async def get_kill_chain(
    token_data: TokenData = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db)
):
    """Queries Kill Chain stage distribution chart data."""
    dashboard_service = DashboardService(db)
    distribution = await dashboard_service.get_kill_chain_distribution(user_id=token_data.sub)
    return ResponseEnvelope(success=True, data=distribution)

