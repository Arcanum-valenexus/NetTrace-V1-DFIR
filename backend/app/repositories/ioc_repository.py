from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.ioc import IOCModel
from app.models.case import CaseModel
from app.models.incident import IncidentModel
from app.models.pcap import PcapSessionModel
from app.models.evidence import EvidenceArtifactModel
from app.models.user import UserModel
from app.repositories.base import BaseRepository


class IOCRepository(BaseRepository[IOCModel]):
    """Async repository for Indicators of Compromise (IOCs)."""

    def __init__(self, session: AsyncSession):
        super().__init__(IOCModel, session)

    def _build_user_ioc_filter(self, user: UserModel):
        user_email_prefix = user.email.split("@")[0] if (user.email and "@" in user.email) else user.email
        
        session_conds = []
        if user.email:
            session_conds.append(PcapSessionModel.uploaded_by == user.email)
        if user.full_name:
            session_conds.append(PcapSessionModel.uploaded_by == user.full_name)
        if user.id:
            session_conds.append(PcapSessionModel.uploaded_by == user.id)
        if user_email_prefix:
            session_conds.append(PcapSessionModel.uploaded_by.contains(user_email_prefix))

        evidence_conds = []
        if user.id:
            evidence_conds.append(EvidenceArtifactModel.owner_investigator_id == user.id)
        if user.email:
            evidence_conds.append(EvidenceArtifactModel.uploaded_by == user.email)
        if user.full_name:
            evidence_conds.append(EvidenceArtifactModel.uploaded_by == user.full_name)
        if user_email_prefix:
            evidence_conds.append(EvidenceArtifactModel.uploaded_by.contains(user_email_prefix))

        incident_conds = []
        if user.full_name:
            incident_conds.append(IncidentModel.assigned_analyst == user.full_name)
        if user.email:
            incident_conds.append(IncidentModel.assigned_analyst == user.email)
        if user.id:
            incident_conds.append(IncidentModel.assigned_analyst == user.id)
        if user_email_prefix:
            incident_conds.append(IncidentModel.assigned_analyst.contains(user_email_prefix))

        user_case_ids = select(CaseModel.id).where(CaseModel.created_by == user.id) if user.id else select(CaseModel.id).where(CaseModel.id == "")
        user_session_ids = select(PcapSessionModel.id).where(or_(*session_conds)) if session_conds else select(PcapSessionModel.id).where(PcapSessionModel.id == "")
        user_evidence_ids = select(EvidenceArtifactModel.id).where(or_(*evidence_conds)) if evidence_conds else select(EvidenceArtifactModel.id).where(EvidenceArtifactModel.id == "")
        user_incident_ids = select(IncidentModel.id).where(or_(*incident_conds)) if incident_conds else select(IncidentModel.id).where(IncidentModel.id == "")

        return or_(
            IOCModel.source_session.in_(user_session_ids),
            IOCModel.evidence_id.in_(user_evidence_ids),
            IOCModel.case_id.in_(user_case_ids),
            IOCModel.incident_id.in_(user_incident_ids)
        )

    async def create_ioc(self, **data) -> IOCModel:
        """Instantiates and persists a single IOC record."""
        return await self.create(**data)

    async def bulk_create_iocs(self, iocs_data: List[dict]) -> List[IOCModel]:
        """Bulk instantiates and persists multiple IOC records."""
        ioc_objs = [IOCModel(**data) for data in iocs_data]
        self.session.add_all(ioc_objs)
        await self.session.flush()
        return ioc_objs

    async def get_ioc(self, ioc_id: str, user: Optional[UserModel] = None) -> Optional[IOCModel]:
        """Fetch single IOC by ID with optional user filter."""
        query = select(IOCModel).where(IOCModel.id == ioc_id, IOCModel.is_deleted == False)
        if user:
            query = query.where(self._build_user_ioc_filter(user))
        result = await self.session.execute(query)
        return result.scalars().first()

    async def list_iocs(
        self,
        type: Optional[str] = None,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        session: Optional[str] = None,
        incident: Optional[str] = None,
        case: Optional[str] = None,
        user: Optional[UserModel] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[IOCModel]:
        """Lists active non-deleted IOC records with optional filters."""
        query = select(IOCModel).where(IOCModel.is_deleted == False)

        if user:
            query = query.where(self._build_user_ioc_filter(user))
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

    async def update_status(self, ioc_id: str, new_status: str, user: Optional[UserModel] = None) -> Optional[IOCModel]:
        """Updates IOC lifecycle status (Active, Investigating, Whitelisted, Blocked)."""
        ioc = await self.get_ioc(ioc_id, user=user)
        if ioc:
            ioc.status = new_status
            await self.session.flush()
            await self.session.refresh(ioc)
        return ioc

    async def delete_ioc(self, ioc_id: str, deleted_by: Optional[str] = None, user: Optional[UserModel] = None) -> bool:
        """Soft deletes IOC record."""
        ioc = await self.get_ioc(ioc_id, user=user)
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
