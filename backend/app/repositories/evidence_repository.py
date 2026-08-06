from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.evidence import EvidenceArtifactModel, ChainOfCustodyModel
from app.models.user import UserModel
from app.repositories.base import BaseRepository


class EvidenceRepository(BaseRepository[EvidenceArtifactModel]):
    """Async repository for Evidence Artifacts and Chain of Custody."""

    def __init__(self, session: AsyncSession):
        super().__init__(EvidenceArtifactModel, session)

    def _build_user_filters(self, user: UserModel):
        filters = [
            EvidenceArtifactModel.owner_investigator_id == user.id,
            EvidenceArtifactModel.uploaded_by == user.email,
            EvidenceArtifactModel.uploaded_by == user.full_name,
        ]
        if user.email and "@" in user.email:
            filters.append(EvidenceArtifactModel.uploaded_by.contains(user.email.split("@")[0]))
        return filters

    async def get_evidence_details(self, evidence_id: str, user: Optional[UserModel] = None) -> Optional[EvidenceArtifactModel]:
        """Fetch evidence artifact with chain of custody audit history and optional user filter."""
        query = (
            select(EvidenceArtifactModel)
            .options(selectinload(EvidenceArtifactModel.chain_of_custody))
            .where(EvidenceArtifactModel.id == evidence_id, EvidenceArtifactModel.is_deleted == False)
        )
        if user:
            query = query.where(or_(*self._build_user_filters(user)))
        result = await self.session.execute(query)
        return result.scalars().first()

    async def list_evidence(
        self,
        category: Optional[str] = None,
        case_id: Optional[str] = None,
        user: Optional[UserModel] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[EvidenceArtifactModel]:
        """List active evidence artifacts with optional filters."""
        query = select(EvidenceArtifactModel).options(
            selectinload(EvidenceArtifactModel.chain_of_custody)
        ).where(EvidenceArtifactModel.is_deleted == False)

        if user:
            query = query.where(or_(*self._build_user_filters(user)))
        if category:
            query = query.where(EvidenceArtifactModel.category == category)
        if case_id:
            query = query.where(EvidenceArtifactModel.case_id == case_id)

        query = query.offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def add_custody_entry(self, **custody_data) -> ChainOfCustodyModel:
        """Add immutable chain of custody audit log."""
        entry = ChainOfCustodyModel(**custody_data)
        self.session.add(entry)
        await self.session.flush()
        await self.session.refresh(entry)
        return entry

    async def soft_delete_evidence(self, evidence_id: str, deleted_by: str, user: Optional[UserModel] = None) -> bool:
        """Soft-delete evidence artifact while preserving audit trail."""
        evidence = await self.get_evidence_details(evidence_id, user=user)
        if evidence:
            evidence.is_deleted = True
            evidence.deleted_at = datetime.now(timezone.utc)
            evidence.deleted_by = deleted_by
            await self.session.flush()
            return True
        return False
