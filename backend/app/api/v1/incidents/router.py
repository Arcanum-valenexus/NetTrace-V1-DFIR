from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user_token, require_permissions
from app.core.security import TokenData, PermissionEnum
from app.schemas.incidents import IncidentCreateSchema, IncidentResponseSchema
from app.services.incident_service import IncidentService
from app.schemas.base import ResponseEnvelope

router = APIRouter(prefix="/incidents", tags=["Incidents & Workbench"])


@router.get("", response_model=ResponseEnvelope[List[IncidentResponseSchema]], summary="List Incidents")
async def list_incidents(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Queries active incident telemetry with optional filters."""
    incident_service = IncidentService(db)
    incidents = await incident_service.list_incidents(status=status, severity=severity, category=category)
    return ResponseEnvelope(success=True, data=incidents)


@router.post("", response_model=ResponseEnvelope[IncidentResponseSchema], status_code=status.HTTP_201_CREATED, summary="Create Incident")
async def create_incident(
    payload: IncidentCreateSchema,
    token_data: TokenData = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db)
):
    """Creates a new incident case."""
    incident_service = IncidentService(db)
    incident = await incident_service.create_incident(payload, actor_id=token_data.sub or "usr-alex-01")
    return ResponseEnvelope(success=True, data=incident)


@router.get("/{incident_id}", response_model=ResponseEnvelope[IncidentResponseSchema], summary="Get Incident Details")
async def get_incident(incident_id: str, db: AsyncSession = Depends(get_db)):
    """Fetches detailed incident telemetry including assets, timeline, and notes."""
    incident_service = IncidentService(db)
    incident = await incident_service.get_incident_by_id(incident_id)
    return ResponseEnvelope(success=True, data=incident)


@router.put("/{incident_id}/status", response_model=ResponseEnvelope[IncidentResponseSchema], summary="Update Incident Status")
async def update_status(
    incident_id: str,
    payload: dict,
    token_data: TokenData = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db)
):
    """Updates incident status (e.g. Contained)."""
    incident_service = IncidentService(db)
    updated = await incident_service.update_incident_status(incident_id, payload.get("status", "Contained"), actor_id=token_data.sub or "usr-alex-01")
    return ResponseEnvelope(success=True, data=updated)


@router.post("/{incident_id}/assets/{asset_id}/isolate", response_model=ResponseEnvelope[dict], summary="Isolate Host Asset")
async def isolate_asset(
    incident_id: str,
    asset_id: str,
    token_data: TokenData = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db)
):
    """Isolates target host asset and logs audit trail."""
    incident_service = IncidentService(db)
    asset = await incident_service.isolate_asset(incident_id, asset_id, actor_id=token_data.sub or "usr-alex-01")
    return ResponseEnvelope(success=True, data=asset)
