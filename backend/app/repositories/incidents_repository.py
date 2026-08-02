from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.incident import (
    IncidentModel,
    ImpactedAssetModel,
    TimelineEventModel,
    AnalystNoteModel,
    ContainmentChecklistModel
)
from app.repositories.base import BaseRepository


class IncidentsRepository(BaseRepository[IncidentModel]):
    """Async repository for Incident entities and related forensic models."""

    def __init__(self, session: AsyncSession):
        super().__init__(IncidentModel, session)

    async def get_incident_details(self, incident_id: str) -> Optional[IncidentModel]:
        """Fetch incident with eagerly loaded assets, timeline, notes, and checklist."""
        result = await self.session.execute(
            select(IncidentModel)
            .options(
                selectinload(IncidentModel.impacted_assets),
                selectinload(IncidentModel.timeline_events),
                selectinload(IncidentModel.notes),
                selectinload(IncidentModel.checklist_tasks)
            )
            .where(IncidentModel.id == incident_id, IncidentModel.is_deleted == False)
        )
        return result.scalars().first()

    async def list_incidents(
        self,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        category: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[IncidentModel]:
        """List active incidents with optional status/severity/category filters."""
        query = select(IncidentModel).options(
            selectinload(IncidentModel.impacted_assets),
            selectinload(IncidentModel.timeline_events),
            selectinload(IncidentModel.notes),
            selectinload(IncidentModel.checklist_tasks)
        ).where(IncidentModel.is_deleted == False)

        if status:
            query = query.where(IncidentModel.status == status)
        if severity:
            query = query.where(IncidentModel.severity == severity)
        if category:
            query = query.where(IncidentModel.category == category)

        query = query.offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def isolate_asset(self, incident_id: str, asset_id: str) -> Optional[ImpactedAssetModel]:
        """Update host asset status to Isolated."""
        result = await self.session.execute(
            select(ImpactedAssetModel).where(
                ImpactedAssetModel.id == asset_id,
                ImpactedAssetModel.incident_id == incident_id
            )
        )
        asset = result.scalars().first()
        if asset:
            asset.status = "Isolated"
            await self.session.flush()
            await self.session.refresh(asset)
            return asset
        return None

    async def add_timeline_event(self, **event_data) -> TimelineEventModel:
        """Create new timeline event."""
        event = TimelineEventModel(**event_data)
        self.session.add(event)
        await self.session.flush()
        await self.session.refresh(event)
        return event

    async def add_analyst_note(self, **note_data) -> AnalystNoteModel:
        """Create analyst note."""
        note = AnalystNoteModel(**note_data)
        self.session.add(note)
        await self.session.flush()
        await self.session.refresh(note)
        return note

    async def toggle_checklist_task(self, incident_id: str, task_id: str, completed: bool) -> Optional[ContainmentChecklistModel]:
        """Toggle containment checklist item completion."""
        result = await self.session.execute(
            select(ContainmentChecklistModel).where(
                ContainmentChecklistModel.id == task_id,
                ContainmentChecklistModel.incident_id == incident_id
            )
        )
        task = result.scalars().first()
        if task:
            task.completed = completed
            await self.session.flush()
            await self.session.refresh(task)
            return task
        return None
