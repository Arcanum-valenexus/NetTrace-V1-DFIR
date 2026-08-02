from typing import AsyncGenerator, Callable, List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import TokenData, decode_access_token, PermissionEnum, RoleEnum
from app.core.logging import logger

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> TokenData:
    """Dependency to extract and validate Bearer JWT token."""
    if not credentials:
        # Placeholder fallback for initial foundation testing
        return TokenData(
            sub="usr-system-admin",
            email="admin@nettrace.enterprise",
            role=RoleEnum.LEAD_DFIR,
            permissions=[p.value for p in PermissionEnum],
        )

    token_data = decode_access_token(credentials.credentials)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token_data


def require_permissions(required: List[PermissionEnum]) -> Callable:
    """Dependency factory enforcing RBAC permissions."""
    async def permission_checker(token_data: TokenData = Depends(get_current_user_token)):
        user_perms = set(token_data.permissions)
        required_perms = {p.value for p in required}
        if not required_perms.issubset(user_perms) and token_data.role != RoleEnum.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this operation",
            )
        return token_data
    return permission_checker


# Service Injection Placeholders
def get_pyshark_service():
    from app.services.pcap.pyshark_service import PySharkService
    return PySharkService()

def get_scapy_service():
    from app.services.pcap.scapy_service import ScapyService
    return ScapyService()

def get_hash_service():
    from app.services.evidence.hash_service import HashService
    return HashService()

def get_chain_of_custody_service():
    from app.services.evidence.chain_of_custody_service import ChainOfCustodyService
    return ChainOfCustodyService()

def get_report_service():
    from app.services.reports.report_service import ReportService
    return ReportService()

def get_ioc_service():
    from app.services.ioc.ioc_service import IOCService
    return IOCService()

def get_gemini_service():
    from app.services.ai.gemini_service import GeminiService
    return GeminiService()

def get_storage_service():
    from app.services.storage.storage_service import StorageService
    return StorageService()

def get_audit_service():
    from app.services.audit.audit_service import AuditService
    return AuditService()

def get_timeline_service():
    from app.services.timeline.timeline_service import TimelineService
    return TimelineService()

def get_dashboard_service():
    from app.services.dashboard.dashboard_service import DashboardService
    return DashboardService()
