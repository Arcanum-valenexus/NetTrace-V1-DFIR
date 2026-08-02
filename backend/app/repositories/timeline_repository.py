from sqlalchemy.ext.asyncio import AsyncSession


class TimelineRepository:
    """Repository placeholder for Timeline events."""
    def __init__(self, session: AsyncSession):
        self.session = session
