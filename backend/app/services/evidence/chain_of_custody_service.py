from datetime import datetime, timezone
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.evidence_repository import EvidenceRepository
from app.repositories.audit_repository import AuditRepository


class ChainOfCustodyService:
    """Service enforcing Digital Chain of Custody logging and audit verification."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.evidence_repo = EvidenceRepository(session)
        self.audit_repo = AuditRepository(session)

    async def log_custody_event(
        self,
        evidence_id: str,
        action: str,
        actor: str,
        notes: str,
        investigator_id: str = "usr-alex-01"
    ) -> Dict[str, Any]:
        """Logs digital chain of custody transfer inside an atomic transaction."""
        async with self.session.begin():
            entry = await self.evidence_repo.add_custody_entry(
                evidence_id=evidence_id,
                action=action,
                actor=actor,
                investigator_id=investigator_id,
                investigator_name=actor,
                timestamp=datetime.now(timezone.utc).isoformat(),
                notes=notes,
            )

            await self.audit_repo.log_event(
                event_type="CHAIN_OF_CUSTODY_LOG",
                actor_id=investigator_id,
                action=action,
                details={"evidence_id": evidence_id, "notes": notes},
            )

            return {
                "id": entry.id,
                "evidenceId": entry.evidence_id,
                "action": entry.action,
                "actor": entry.actor,
                "timestamp": entry.timestamp,
                "notes": entry.notes,
            }
