from typing import Any, Dict
from app.core.logging import log_audit_event


class AuditService:
    """Service interface placeholder for system audit trail creation."""

    async def record_event(self, event_type: str, actor_id: str, action: str, details: Dict[str, Any]):
        """Record audit event interface placeholder."""
        log_audit_event(event_type, actor_id, action, details)
        return True
