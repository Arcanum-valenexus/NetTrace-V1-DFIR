from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.case import CaseModel
from app.repositories.base import BaseRepository


class CasesRepository(BaseRepository[CaseModel]):
    """Async repository for Case entities."""

    def __init__(self, session: AsyncSession):
        super().__init__(CaseModel, session)

    async def get_by_case_number(self, case_number: str) -> Optional[CaseModel]:
        """Fetch case by unique case number."""
        result = await self.session.execute(
            select(CaseModel).where(CaseModel.case_number == case_number, CaseModel.is_deleted == False)
        )
        return result.scalars().first()

    async def list_active_cases(self, user_id: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[CaseModel]:
        """List active non-deleted cases."""
        query = select(CaseModel).where(CaseModel.is_deleted == False)
        if user_id:
            query = query.where(CaseModel.created_by == user_id)
        result = await self.session.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())

