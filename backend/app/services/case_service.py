import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.cases_repository import CasesRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.cases import CaseCreateSchema, CaseUpdateSchema, CaseResponseSchema


class CaseService:
    """Service handling Case CRUD operations and audit logging."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.cases_repo = CasesRepository(session)
        self.audit_repo = AuditRepository(session)

    async def create_case(self, payload: CaseCreateSchema, actor_id: str) -> CaseResponseSchema:
        """Creates a new DFIR Case in an atomic transaction."""
        async with self.session.begin():
            case_no = f"CASE-2026-{uuid.uuid4().hex[:4].upper()}"
            case = await self.cases_repo.create(
                case_number=case_no,
                title=payload.title,
                description=payload.description or "DFIR Case Investigation",
                status="Active",
                priority=payload.priority or "High",
                created_by=actor_id,
            )

            await self.audit_repo.log_event(
                event_type="CASE_CREATED",
                actor_id=actor_id,
                action="CREATE_CASE",
                details={"case_id": case.id, "case_number": case.case_number, "title": case.title},
            )

            return CaseResponseSchema(
                id=case.id,
                caseNumber=case.case_number,
                title=case.title,
                description=case.description,
                status=case.status,
                priority=case.priority,
                createdBy=case.created_by,
                createdAt=case.created_at.isoformat(),
                updatedAt=case.updated_at.isoformat(),
            )

    async def get_case_by_id(self, case_id: str) -> CaseResponseSchema:
        """Fetch case details by ID."""
        case = await self.cases_repo.get_by_id(case_id)
        if not case or case.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case with ID '{case_id}' not found.",
            )

        return CaseResponseSchema(
            id=case.id,
            caseNumber=case.case_number,
            title=case.title,
            description=case.description,
            status=case.status,
            priority=case.priority,
            createdBy=case.created_by,
            createdAt=case.created_at.isoformat(),
            updatedAt=case.updated_at.isoformat(),
        )

    async def list_cases(self) -> List[CaseResponseSchema]:
        """List active non-deleted cases."""
        cases = await self.cases_repo.list_active_cases()
        return [
            CaseResponseSchema(
                id=c.id,
                caseNumber=c.case_number,
                title=c.title,
                description=c.description,
                status=c.status,
                priority=c.priority,
                createdBy=c.created_by,
                createdAt=c.created_at.isoformat(),
                updatedAt=c.updated_at.isoformat(),
            )
            for c in cases
        ]

    async def update_case(self, case_id: str, payload: CaseUpdateSchema, actor_id: str) -> CaseResponseSchema:
        """Update case details in an atomic transaction."""
        async with self.session.begin():
            case = await self.cases_repo.get_by_id(case_id)
            if not case or case.is_deleted:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")

            if payload.title is not None:
                case.title = payload.title
            if payload.description is not None:
                case.description = payload.description
            if payload.status is not None:
                case.status = payload.status
            if payload.priority is not None:
                case.priority = payload.priority

            await self.audit_repo.log_event(
                event_type="CASE_UPDATED",
                actor_id=actor_id,
                action="UPDATE_CASE",
                details={"case_id": case_id, "updated_fields": payload.model_dump(exclude_unset=True)},
            )

            return CaseResponseSchema(
                id=case.id,
                caseNumber=case.case_number,
                title=case.title,
                description=case.description,
                status=case.status,
                priority=case.priority,
                createdBy=case.created_by,
                createdAt=case.created_at.isoformat(),
                updatedAt=case.updated_at.isoformat(),
            )

    async def soft_delete_case(self, case_id: str, actor_id: str) -> bool:
        """Soft delete case preserving forensic audit integrity."""
        async with self.session.begin():
            case = await self.cases_repo.get_by_id(case_id)
            if not case or case.is_deleted:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")

            case.is_deleted = True
            case.deleted_at = datetime.now(timezone.utc)
            case.deleted_by = actor_id

            await self.audit_repo.log_event(
                event_type="CASE_DELETED",
                actor_id=actor_id,
                action="SOFT_DELETE_CASE",
                details={"case_id": case_id},
            )
            return True
