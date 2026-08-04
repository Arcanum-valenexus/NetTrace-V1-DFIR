import json
from datetime import datetime, timezone
from typing import List, Optional, Any, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.incident import TimelineEventModel
from app.repositories.base import BaseRepository


class TimelineRepository(BaseRepository[TimelineEventModel]):
    """Async repository for incident timeline events."""

    def __init__(self, session: AsyncSession):
        super().__init__(TimelineEventModel, session)

    async def create_event(
        self,
        incident_id: str,
        event_type: str,
        description: str,
        source: str = "NetTrace Forensic Engine",
        severity: str = "Medium",
        timestamp: Optional[str] = None,
        raw_log: Optional[str] = None,
        associated_iocs: Optional[List[str]] = None,
        threat_actor: Optional[str] = None,
    ) -> TimelineEventModel:
        """Instantiates and persists a timeline event."""
        now_ts = timestamp or datetime.now(timezone.utc).isoformat()
        event = TimelineEventModel(
            incident_id=incident_id,
            timestamp=now_ts,
            source=source,
            event_type=event_type,
            description=description,
            severity=severity,
            raw_log=raw_log,
            associated_iocs=associated_iocs or [],
            threat_actor=threat_actor,
        )
        self.session.add(event)
        await self.session.flush()
        await self.session.refresh(event)
        return event

    async def create_pcap_event(
        self,
        event_type: str,
        description: str,
        user: str,
        case_id: str,
        incident_id: str,
        evidence_id: Optional[str] = None,
        session_id: Optional[str] = None,
        severity: str = "Info",
    ) -> TimelineEventModel:
        """Creates a specialized PCAP forensic timeline event including user, case, evidence, and session metadata."""
        raw_log_dict = {
            "user": user,
            "case": case_id,
            "incident": incident_id,
            "evidence": evidence_id,
            "session": session_id,
        }
        return await self.create_event(
            incident_id=incident_id,
            event_type=event_type,
            description=description,
            source="NetTrace PCAP Forensics Engine",
            severity=severity,
            raw_log=json.dumps(raw_log_dict),
        )

    async def list_events_by_incident(self, incident_id: str) -> List[TimelineEventModel]:
        """Queries timeline events associated with a specific incident."""
        result = await self.session.execute(
            select(TimelineEventModel)
            .where(TimelineEventModel.incident_id == incident_id)
            .order_by(TimelineEventModel.timestamp.asc())
        )
        return list(result.scalars().all())
