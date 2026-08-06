import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.repositories.incidents_repository import IncidentsRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.incidents import IncidentCreateSchema, IncidentResponseSchema


from app.models.user import UserModel
from sqlalchemy import select


class IncidentService:
    """Service handling Incident Operations, Asset Isolation, Attack Timelines, and Checklist Toggles."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.incidents_repo = IncidentsRepository(session)
        self.audit_repo = AuditRepository(session)

    async def _get_user(self, user_id: Optional[str]) -> Optional[UserModel]:
        if not user_id:
            return None
        res = await self.session.execute(
            select(UserModel).where(
                or_(
                    UserModel.id == user_id,
                    UserModel.email == user_id,
                    UserModel.full_name == user_id
                )
            )
        )
        return res.scalars().first()

    async def create_incident(self, payload: IncidentCreateSchema, actor_id: str) -> IncidentResponseSchema:
        """Creates a new incident investigation in an atomic transaction."""
        user = await self._get_user(actor_id)
        assigned_analyst = payload.assignedAnalyst or (user.full_name if user else actor_id)

        incident_no = f"INC-2026-{uuid.uuid4().hex[:4].upper()}"

        if not self.session.in_transaction():
            async with self.session.begin():
                incident = await self.incidents_repo.create(
                    incident_number=incident_no,
                    title=payload.title,
                    severity=payload.severity,
                    status="Investigating",
                    category=payload.category,
                    assigned_analyst=assigned_analyst,
                    created_by=actor_id,
                    summary=payload.summary or "Automated DFIR telemetry incident creation.",
                    attack_vector=payload.attackVector or "Initial Access via Compromised Credentials",
                    current_stage=payload.currentStage or "Initial Access",
                    mitre_tactics=[{"id": "T1059", "name": "Command and Scripting Interpreter", "tactic": "Execution"}],
                )

                await self.audit_repo.log_event(
                    event_type="INCIDENT_CREATED",
                    actor_id=actor_id,
                    action="CREATE_INCIDENT",
                    details={"incident_id": incident.id, "incident_number": incident.incident_number, "title": incident.title},
                )
        else:
            incident = await self.incidents_repo.create(
                incident_number=incident_no,
                title=payload.title,
                severity=payload.severity,
                status="Investigating",
                category=payload.category,
                assigned_analyst=assigned_analyst,
                created_by=actor_id,
                summary=payload.summary or "Automated DFIR telemetry incident creation.",
                attack_vector=payload.attackVector or "Initial Access via Compromised Credentials",
                current_stage=payload.currentStage or "Initial Access",
                mitre_tactics=[{"id": "T1059", "name": "Command and Scripting Interpreter", "tactic": "Execution"}],
            )

            await self.audit_repo.log_event(
                event_type="INCIDENT_CREATED",
                actor_id=actor_id,
                action="CREATE_INCIDENT",
                details={"incident_id": incident.id, "incident_number": incident.incident_number, "title": incident.title},
            )
            await self.session.commit()

        return await self.get_incident_by_id(incident.id, user_id=actor_id)

    async def get_incident_by_id(self, incident_id: str, user_id: Optional[str] = None) -> IncidentResponseSchema:
        """Fetch complete incident telemetry matching frontend interface with ownership enforcement."""
        user = await self._get_user(user_id) if user_id else None
        incident = await self.incidents_repo.get_incident_details(incident_id, user=user)
        if not incident:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Incident with ID '{incident_id}' not found.",
            )

        return IncidentResponseSchema(
            id=incident.id,
            incidentNumber=incident.incident_number,
            title=incident.title,
            severity=incident.severity,
            status=incident.status,
            category=incident.category,
            assignedAnalyst=incident.assigned_analyst,
            createdAt=incident.created_at.isoformat(),
            updatedAt=incident.updated_at.isoformat(),
            summary=incident.summary or "",
            attackVector=incident.attack_vector or "",
            currentStage=incident.current_stage,
            impactedAssets=[
                {
                    "id": a.id,
                    "hostname": a.hostname,
                    "ipAddress": a.ip_address,
                    "os": a.os or "Windows Server 2022",
                    "macAddress": a.mac_address or "00:50:56:A1:B2:C3",
                    "assetType": a.asset_type,
                    "status": a.status,
                    "owner": a.owner,
                }
                for a in incident.impacted_assets
            ],
            timeline=[
                {
                    "id": t.id,
                    "incidentId": t.incident_id,
                    "timestamp": t.timestamp,
                    "source": t.source,
                    "eventType": t.event_type,
                    "description": t.description,
                    "severity": t.severity,
                    "rawLog": t.raw_log,
                }
                for t in incident.timeline_events
            ],
            mitreTactics=incident.mitre_tactics or [],
            notes=[{"id": n.id, "author": n.author, "timestamp": n.timestamp, "content": n.content} for n in incident.notes],
            containmentChecklist=[{"id": c.id, "task": c.task, "completed": c.completed, "assignedTo": c.assigned_to} for c in incident.checklist_tasks],
        )

    async def list_incidents(
        self,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        category: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> List[IncidentResponseSchema]:
        """List active incidents filtered by user identity."""
        user = await self._get_user(user_id) if user_id else None
        incidents = await self.incidents_repo.list_incidents(status=status, severity=severity, category=category, user=user)
        return [
            IncidentResponseSchema(
                id=inc.id,
                incidentNumber=inc.incident_number,
                title=inc.title,
                severity=inc.severity,
                status=inc.status,
                category=inc.category,
                assignedAnalyst=inc.assigned_analyst,
                createdAt=inc.created_at.isoformat(),
                updatedAt=inc.updated_at.isoformat(),
                summary=inc.summary or "",
                attackVector=inc.attack_vector or "",
                currentStage=inc.current_stage,
                impactedAssets=[],
                timeline=[],
                mitreTactics=[],
                notes=[],
                containmentChecklist=[],
            )
            for inc in incidents
        ]

    async def update_incident_status(self, incident_id: str, new_status: str, actor_id: str) -> IncidentResponseSchema:
        """Update incident status with ownership enforcement."""
        user = await self._get_user(actor_id)
        incident = await self.incidents_repo.get_incident_details(incident_id, user=user)
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

        incident.status = new_status
        await self.audit_repo.log_event(
            event_type="INCIDENT_STATUS_CHANGE",
            actor_id=actor_id,
            action="UPDATE_STATUS",
            details={"incident_id": incident_id, "new_status": new_status},
        )
        await self.session.commit()
        return await self.get_incident_by_id(incident_id, user_id=actor_id)

    async def isolate_asset(self, incident_id: str, asset_id: str, actor_id: str) -> dict:
        """Isolate host asset with ownership enforcement."""
        user = await self._get_user(actor_id)
        incident = await self.incidents_repo.get_incident_details(incident_id, user=user)
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

        asset = await self.incidents_repo.isolate_asset(incident_id, asset_id)
        if not asset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found.")

        await self.audit_repo.log_event(
            event_type="HOST_ASSET_ISOLATION",
            actor_id=actor_id,
            action="ISOLATE_HOST",
            details={"incident_id": incident_id, "asset_id": asset_id, "hostname": asset.hostname},
        )
        await self.session.commit()

        return {
            "id": asset.id,
            "hostname": asset.hostname,
            "ipAddress": asset.ip_address,
            "status": asset.status,
        }
