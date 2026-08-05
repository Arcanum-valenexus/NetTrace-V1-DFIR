from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user_token, require_permissions
from app.core.security import TokenData, PermissionEnum
from app.schemas.cases import CaseCreateSchema, CaseUpdateSchema, CaseResponseSchema
from app.services.case_service import CaseService
from app.schemas.base import ResponseEnvelope

router = APIRouter(prefix="/cases", tags=["Case Management"])


@router.get("", response_model=ResponseEnvelope[List[CaseResponseSchema]], summary="List Cases")
async def list_cases(
    token_data: TokenData = Depends(require_permissions([PermissionEnum.CASES_READ])),
    db: AsyncSession = Depends(get_db)
):
    """Queries active cases."""
    case_service = CaseService(db)
    cases = await case_service.list_cases(user_id=token_data.sub)
    return ResponseEnvelope(success=True, data=cases)


@router.post("", response_model=ResponseEnvelope[CaseResponseSchema], status_code=status.HTTP_201_CREATED, summary="Create Case")
async def create_case(
    payload: CaseCreateSchema,
    token_data: TokenData = Depends(require_permissions([PermissionEnum.CASES_WRITE])),
    db: AsyncSession = Depends(get_db)
):
    """Creates a new DFIR Case."""
    case_service = CaseService(db)
    case = await case_service.create_case(payload, actor_id=token_data.sub)
    return ResponseEnvelope(success=True, data=case)


@router.get("/{case_id}", response_model=ResponseEnvelope[CaseResponseSchema], summary="Get Case Details")
async def get_case(
    case_id: str,
    token_data: TokenData = Depends(require_permissions([PermissionEnum.CASES_READ])),
    db: AsyncSession = Depends(get_db)
):
    """Fetches case details."""
    case_service = CaseService(db)
    case = await case_service.get_case_by_id(case_id)
    return ResponseEnvelope(success=True, data=case)


@router.put("/{case_id}", response_model=ResponseEnvelope[CaseResponseSchema], summary="Update Case")
async def update_case(
    case_id: str,
    payload: CaseUpdateSchema,
    token_data: TokenData = Depends(require_permissions([PermissionEnum.CASES_WRITE])),
    db: AsyncSession = Depends(get_db)
):
    """Updates case metadata."""
    case_service = CaseService(db)
    case = await case_service.update_case(case_id, payload, actor_id=token_data.sub)
    return ResponseEnvelope(success=True, data=case)


@router.delete("/{case_id}", response_model=ResponseEnvelope[dict], summary="Soft Delete Case")
async def delete_case(
    case_id: str,
    token_data: TokenData = Depends(require_permissions([PermissionEnum.CASES_WRITE])),
    db: AsyncSession = Depends(get_db)
):
    """Soft deletes case while preserving forensic audit trail."""
    case_service = CaseService(db)
    await case_service.soft_delete_case(case_id, actor_id=token_data.sub)
    return ResponseEnvelope(success=True, message="Case soft-deleted successfully")
