from typing import Any, Dict
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.repositories.users_repository import UsersRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.auth import LoginRequest, UserRegisterRequest, AuthTokenResponse


class AuthService:
    """Service handling User Registration, Authentication, Password Verification, and Token Issuance."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.users_repo = UsersRepository(session)
        self.audit_repo = AuditRepository(session)

    async def register_user(self, payload: UserRegisterRequest) -> Dict[str, Any]:
        """Registers a new investigator account inside an atomic transaction."""
        async with self.session.begin():
            existing_user = await self.users_repo.get_by_email(payload.email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"An investigator account with email '{payload.email}' already exists.",
                )

            hashed_password = get_password_hash(payload.password)
            user = await self.users_repo.create(
                email=payload.email,
                password_hash=hashed_password,
                full_name=payload.fullName,
                role=payload.role or "Lead DFIR Investigator",
                organization="Cyber Defense & Forensics Labs",
            )

            await self.audit_repo.log_event(
                event_type="USER_REGISTRATION",
                actor_id=user.id,
                action="REGISTER_ACCOUNT",
                details={"email": user.email, "role": user.role},
            )

            return {
                "id": user.id,
                "email": user.email,
                "fullName": user.full_name,
                "role": user.role,
                "created_at": user.created_at.isoformat(),
            }

    async def login_user(self, payload: LoginRequest) -> AuthTokenResponse:
        """Authenticates user and issues JWT tokens."""
        async with self.session.begin():
            user = await self.users_repo.get_by_email(payload.email)
            if not user or not verify_password(payload.password, user.password_hash):
                await self.audit_repo.log_event(
                    event_type="LOGIN_FAILED",
                    actor_id=payload.email,
                    action="LOGIN_FAILURE",
                    status="FAILED",
                    details={"reason": "Invalid credentials"},
                )
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password",
                )

            access_token = create_access_token(
                subject=user.id,
                email=user.email,
                role=user.role,
                permissions=["cases:read", "cases:write", "incidents:read", "incidents:write", "evidence:upload", "pcap:analyze", "reports:generate"],
            )
            refresh_token = create_refresh_token(subject=user.id)

            await self.users_repo.create_user_session(
                user_id=user.id,
                browser="Chrome 126.0 (Desktop)",
                device="NetTrace SOC Command Station",
                operating_system="Windows 11 DFIR Edition",
                ip_address="127.0.0.1",
                location="SOC Terminal (US-EAST)",
                login_time=user.created_at.isoformat(),
                last_active="Active Now",
                is_current=True,
            )

            await self.audit_repo.log_event(
                event_type="USER_LOGIN",
                actor_id=user.id,
                action="LOGIN_SUCCESS",
                details={"email": user.email, "role": user.role},
            )

            return AuthTokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                token_type="Bearer",
                expires_in=3600,
            )
