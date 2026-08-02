from sqlalchemy.ext.asyncio import AsyncSession


class IOCRepository:
    """Repository placeholder for Indicators of Compromise."""
    def __init__(self, session: AsyncSession):
        self.session = session
