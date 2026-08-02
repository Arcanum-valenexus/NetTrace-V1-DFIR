from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession


class CasesRepository:
    """Repository placeholder for Case entities."""
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_case_by_number(self, case_number: str):
        pass
