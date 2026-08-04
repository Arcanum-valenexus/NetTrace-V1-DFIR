from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.ioc import IOCModel
from app.repositories.base import BaseRepository


class IOCRepository(BaseRepository[IOCModel]):
    """Async repository for Indicators of Compromise (IOCs)."""

    def __init__(self, session: AsyncSession):
        super().__init__(IOCModel, session)

    async def create_ioc(self, **data) -> IOCModel:
        """Instantiates and persists a single IOC record."""
        return await self.create(**data)

    async def bulk_create_iocs(self, iocs_data: List[dict]) -> List[IOCModel]:
        """Bulk instantiates and persists multiple IOC records."""
        ioc_objs = [IOCModel(**data) for data in iocs_data]
        self.session.add_all(ioc_objs)
        await self.session.flush()
        return ioc_objs

    async def get_ioc(self, ioc_id: str) -> Optional[IOCModel]:
        """Fetch single IOC by ID."""
        return await self.get_by_id(ioc_id)

    async def list_iocs(
        self,
        type: Optional[str] = None,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        session: Optional[str] = None,
        incident: Optional[str] = None,
        case: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[IOCModel]:
        """Lists active non-deleted IOC records with optional filters."""
        query = select(IOCModel).where(IOCModel.is_deleted == False)

        if type:
            query = query.where(IOCModel.type == type)
        if status:
            query = query.where(IOCModel.status == status)
        if severity:
            query = query.where(IOCModel.severity == severity)
        if session:
            query = query.where(IOCModel.source_session == session)
        if incident:
            query = query.where(IOCModel.incident_id == incident)
        if case:
            query = query.where(IOCModel.case_id == case)

        query = query.order_by(IOCModel.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def update_status(self, ioc_id: str, new_status: str) -> Optional[IOCModel]:
        """Updates IOC lifecycle status (Active, Investigating, Whitelisted, Blocked)."""
        ioc = await self.get_by_id(ioc_id)
        if ioc:
            ioc.status = new_status
            await self.session.flush()
            await self.session.refresh(ioc)
        return ioc

    async def delete_ioc(self, ioc_id: str, deleted_by: Optional[str] = None) -> bool:
        """Soft deletes IOC record."""
        ioc = await self.get_by_id(ioc_id)
        if ioc:
            ioc.is_deleted = True
            ioc.deleted_at = datetime.now(timezone.utc)
            ioc.deleted_by = deleted_by or "System"
            await self.session.flush()
            return True
        return False

    async def find_by_value(self, value: str) -> Optional[IOCModel]:
        """Find active IOC record by exact indicator value."""
        result = await self.session.execute(
            select(IOCModel).where(IOCModel.value == value, IOCModel.is_deleted == False)
        )
        return result.scalars().first()

    async def list_by_session(self, session_id: str) -> List[IOCModel]:
        """List active IOCs associated with a specific PCAP session."""
        result = await self.session.execute(
            select(IOCModel).where(IOCModel.source_session == session_id, IOCModel.is_deleted == False)
        )
        return list(result.scalars().all())

    async def list_by_incident(self, incident_id: str) -> List[IOCModel]:
        """List active IOCs associated with a specific Incident."""
        result = await self.session.execute(
            select(IOCModel).where(IOCModel.incident_id == incident_id, IOCModel.is_deleted == False)
        )
        return list(result.scalars().all())
