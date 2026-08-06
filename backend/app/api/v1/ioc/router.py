from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user_token, require_permissions
from app.core.security import TokenData, PermissionEnum
from app.services.ioc_service import IOCService
from app.schemas.ioc import (
    IOCResponseSchema,
    IOCListResponseSchema,
    IOCStatusUpdateSchema,
    IOCExtractRequestSchema,
)
from app.schemas.base import ResponseEnvelope

router = APIRouter(prefix="/ioc", tags=["Indicators of Compromise"])


@router.get("", response_model=ResponseEnvelope[IOCListResponseSchema], summary="List Indicators of Compromise")
async def list_iocs(
    type: Optional[str] = Query(None, description="Filter by IOC type (IPv4, Domain, Hash, etc.)"),
    status: Optional[str] = Query(None, description="Filter by status (Active, Whitelisted, Blocked, etc.)"),
    severity: Optional[str] = Query(None, description="Filter by severity (Critical, High, Medium, Low)"),
    session: Optional[str] = Query(None, description="Filter by PCAP session ID"),
    incident: Optional[str] = Query(None, description="Filter by incident ID"),
    case: Optional[str] = Query(None, description="Filter by case ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    token_data: TokenData = Depends(require_permissions([PermissionEnum.CASES_READ])),
    db: AsyncSession = Depends(get_db)
):
    """Queries extracted Indicators of Compromise (IOCs) with optional filtering."""
    ioc_service = IOCService(db)
    iocs_data = await ioc_service.list_iocs(
        type=type, status=status, severity=severity, session=session, incident=incident, case=case, user_id=token_data.sub, skip=skip, limit=limit
    )
    return ResponseEnvelope(success=True, data=iocs_data)


@router.get("/{ioc_id}", response_model=ResponseEnvelope[IOCResponseSchema], summary="Get IOC Details")
async def get_ioc(
    ioc_id: str = Path(...),
    token_data: TokenData = Depends(require_permissions([PermissionEnum.CASES_READ])),
    db: AsyncSession = Depends(get_db)
):
    """Fetches details for a specific IOC record."""
    ioc_service = IOCService(db)
    ioc = await ioc_service.get_ioc(ioc_id, user_id=token_data.sub)
    return ResponseEnvelope(success=True, data=ioc)


@router.post("/extract", response_model=ResponseEnvelope[List[IOCResponseSchema]], status_code=status.HTTP_201_CREATED, summary="Trigger IOC Extraction for Session")
async def extract_iocs(
    payload: IOCExtractRequestSchema,
    token_data: TokenData = Depends(require_permissions([PermissionEnum.EVIDENCE_UPLOAD])),
    db: AsyncSession = Depends(get_db)
):
    """Triggers pattern matching extraction of IOCs from PCAP packet payloads."""
    ioc_service = IOCService(db)
    actor = token_data.email or token_data.sub
    async with db.begin():
        extracted = await ioc_service.extract_iocs_from_session(
            session_id=payload.sessionId,
            case_id=payload.caseId,
            incident_id=payload.incidentId,
            actor_id=actor,
        )
    return ResponseEnvelope(success=True, data=extracted)


@router.put("/{ioc_id}/status", response_model=ResponseEnvelope[IOCResponseSchema], summary="Update IOC Status")
async def update_ioc_status(
    ioc_id: str = Path(...),
    payload: IOCStatusUpdateSchema = ...,
    token_data: TokenData = Depends(require_permissions([PermissionEnum.INCIDENTS_WRITE])),
    db: AsyncSession = Depends(get_db)
):
    """Updates IOC status (Active, Whitelisted, Blocked, etc.) and logs timeline event."""
    ioc_service = IOCService(db)
    actor = token_data.email or token_data.sub
    async with db.begin():
        updated = await ioc_service.update_status(ioc_id=ioc_id, new_status=payload.status, actor_id=actor, user_id=token_data.sub)
    return ResponseEnvelope(success=True, data=updated)


@router.delete("/{ioc_id}", response_model=ResponseEnvelope[dict], summary="Delete IOC Record")
async def delete_ioc(
    ioc_id: str = Path(...),
    token_data: TokenData = Depends(require_permissions([PermissionEnum.EVIDENCE_DELETE])),
    db: AsyncSession = Depends(get_db)
):
    """Soft deletes an IOC record."""
    ioc_service = IOCService(db)
    actor = token_data.email or token_data.sub
    async with db.begin():
        await ioc_service.delete_ioc(ioc_id=ioc_id, actor_id=actor, user_id=token_data.sub)
    return ResponseEnvelope(success=True, message="IOC record deleted successfully")
