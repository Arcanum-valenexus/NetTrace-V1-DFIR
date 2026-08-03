import bcrypt
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from jose import JWTError, jwt
from pydantic import BaseModel
from app.core.config import settings


class RoleEnum(str, Enum):
    SUPER_ADMIN = "Super Admin"
    LEAD_DFIR = "Lead DFIR Investigator"
    SECURITY_ANALYST = "Security Analyst"
    INCIDENT_RESPONDER = "Incident Responder"
    AUDITOR = "Auditor"
    READ_ONLY = "Read Only"


class PermissionEnum(str, Enum):
    CASES_READ = "cases:read"
    CASES_WRITE = "cases:write"
    INCIDENTS_READ = "incidents:read"
    INCIDENTS_WRITE = "incidents:write"
    EVIDENCE_UPLOAD = "evidence:upload"
    EVIDENCE_DELETE = "evidence:delete"
    PCAP_ANALYZE = "pcap:analyze"
    REPORTS_GENERATE = "reports:generate"
    SYSTEM_SETTINGS = "system:settings"


class TokenData(BaseModel):
    sub: Optional[str] = None
    email: Optional[str] = None
    role: Optional[RoleEnum] = None
    permissions: List[str] = []
    exp: Optional[int] = None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against bcrypt hashed password."""
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8')[:72], hashed_password.encode('utf-8'))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Generate bcrypt hash for password."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8')[:72], salt)
    return hashed.decode('utf-8')



DEFAULT_ROLE_PERMISSIONS: Dict[str, List[str]] = {
    RoleEnum.SUPER_ADMIN.value: [
        PermissionEnum.CASES_READ.value,
        PermissionEnum.CASES_WRITE.value,
        PermissionEnum.INCIDENTS_READ.value,
        PermissionEnum.INCIDENTS_WRITE.value,
        PermissionEnum.EVIDENCE_UPLOAD.value,
        PermissionEnum.EVIDENCE_DELETE.value,
        PermissionEnum.PCAP_ANALYZE.value,
        PermissionEnum.REPORTS_GENERATE.value,
        PermissionEnum.SYSTEM_SETTINGS.value,
    ],
    RoleEnum.LEAD_DFIR.value: [
        PermissionEnum.CASES_READ.value,
        PermissionEnum.CASES_WRITE.value,
        PermissionEnum.INCIDENTS_READ.value,
        PermissionEnum.INCIDENTS_WRITE.value,
        PermissionEnum.EVIDENCE_UPLOAD.value,
        PermissionEnum.EVIDENCE_DELETE.value,
        PermissionEnum.PCAP_ANALYZE.value,
        PermissionEnum.REPORTS_GENERATE.value,
        PermissionEnum.SYSTEM_SETTINGS.value,
    ],
    RoleEnum.SECURITY_ANALYST.value: [
        PermissionEnum.CASES_READ.value,
        PermissionEnum.CASES_WRITE.value,
        PermissionEnum.INCIDENTS_READ.value,
        PermissionEnum.INCIDENTS_WRITE.value,
        PermissionEnum.EVIDENCE_UPLOAD.value,
        PermissionEnum.PCAP_ANALYZE.value,
        PermissionEnum.REPORTS_GENERATE.value,
    ],
    RoleEnum.INCIDENT_RESPONDER.value: [
        PermissionEnum.CASES_READ.value,
        PermissionEnum.INCIDENTS_READ.value,
        PermissionEnum.INCIDENTS_WRITE.value,
        PermissionEnum.EVIDENCE_UPLOAD.value,
        PermissionEnum.PCAP_ANALYZE.value,
    ],
    RoleEnum.AUDITOR.value: [
        PermissionEnum.CASES_READ.value,
        PermissionEnum.INCIDENTS_READ.value,
        PermissionEnum.REPORTS_GENERATE.value,
    ],
    RoleEnum.READ_ONLY.value: [
        PermissionEnum.CASES_READ.value,
        PermissionEnum.INCIDENTS_READ.value,
    ],
}


def get_permissions_for_role(role: str) -> List[str]:
    """Retrieve default permissions array for a given system role."""
    return DEFAULT_ROLE_PERMISSIONS.get(role, DEFAULT_ROLE_PERMISSIONS[RoleEnum.LEAD_DFIR.value])


def create_access_token(subject: str, email: str, role: str, permissions: Optional[List[str]] = None, expires_delta: Optional[timedelta] = None) -> str:
    """Generate JWT Access Token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    if permissions is None:
        permissions = get_permissions_for_role(role)

    to_encode: Dict[str, Any] = {
        "sub": subject,
        "email": email,
        "role": role,
        "permissions": permissions,
        "exp": expire,
        "type": "access",
    }
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """Generate JWT Refresh Token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode: Dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "type": "refresh",
    }
    return jwt.encode(to_encode, settings.JWT_REFRESH_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[TokenData]:
    """Decode and validate access token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "access":
            return None
        return TokenData(
            sub=payload.get("sub"),
            email=payload.get("email"),
            role=payload.get("role"),
            permissions=payload.get("permissions", []),
            exp=payload.get("exp"),
        )
    except JWTError:
        return None


def decode_refresh_token(token: str) -> Optional[TokenData]:
    """Decode and validate refresh token using JWT_REFRESH_SECRET."""
    try:
        payload = jwt.decode(token, settings.JWT_REFRESH_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        return TokenData(
            sub=payload.get("sub"),
            exp=payload.get("exp"),
        )
    except JWTError:
        return None

