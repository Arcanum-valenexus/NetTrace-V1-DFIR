from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession


class IncidentsRepository:
    """Repository placeholder for Incident entities."""
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_incident_number(self, incident_number: str):
        pass
