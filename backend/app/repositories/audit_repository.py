from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit import AuditLogModel
from app.repositories.base import BaseRepository


class AuditRepository(BaseRepository[AuditLogModel]):
    """Async repository for system Security Audit Logs."""

    def __init__(self, session: AsyncSession):
        super().__init__(AuditLogModel, session)

    async def log_event(self, event_type: str, actor_id: str, action: str, details: dict, status: str = "SUCCESS") -> AuditLogModel:
        """Create new audit log record."""
        log = AuditLogModel(
            event_type=event_type,
            actor_id=actor_id,
            action=action,
            status=status,
            details=details,
        )
        self.session.add(log)
        await self.session.flush()
        await self.session.refresh(log)
        return log

    async def list_logs(self, event_type: Optional[str] = None, limit: int = 100) -> List[AuditLogModel]:
        """List audit logs."""
        query = select(AuditLogModel).order_by(AuditLogModel.created_at.desc())
        if event_type:
            query = query.where(AuditLogModel.event_type == event_type)
        query = query.limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())
