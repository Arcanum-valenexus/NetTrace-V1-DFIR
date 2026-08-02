from sqlalchemy.ext.asyncio import AsyncSession


class ReportsRepository:
    """Repository placeholder for DFIR Reports."""
    def __init__(self, session: AsyncSession):
        self.session = session
