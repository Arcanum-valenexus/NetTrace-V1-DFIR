from sqlalchemy.ext.asyncio import AsyncSession


class AuditRepository:
    """Repository placeholder for Security Audit logs."""
    def __init__(self, session: AsyncSession):
        self.session = session
