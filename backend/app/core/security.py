from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from app.core.config import settings

# Password Crypt Context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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
    """Verify plain password against hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate bcrypt hash for password."""
    return pwd_context.hash(password)


def create_access_token(subject: str, email: str, role: str, permissions: List[str], expires_delta: Optional[timedelta] = None) -> str:
    """Generate JWT Access Token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

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
