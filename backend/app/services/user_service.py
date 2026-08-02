from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.users_repository import UsersRepository
from app.schemas.users import UserProfileResponse, UserSessionResponse, UserActivityResponse


class UserService:
    """Service handling User Profile, Session Revocation, and Security Audit Logs."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.users_repo = UsersRepository(session)

    async def get_user_profile(self, user_id: str) -> UserProfileResponse:
        """Fetch user profile matching frontend `UserProfile` interface."""
        user = await self.users_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found.",
            )

        sessions = await self.users_repo.list_user_sessions(user_id)
        activities = await self.users_repo.list_activity_logs(user_id)

        session_responses = [
            UserSessionResponse(
                id=s.id,
                browser=s.browser,
                device=s.device,
                operatingSystem=s.operating_system,
                ipAddress=s.ip_address,
                location=s.location,
                loginTime=s.login_time,
                lastActive=s.last_active,
                isCurrent=s.is_current,
            )
            for s in sessions
        ]

        activity_responses = [
            UserActivityResponse(
                id=a.id,
                action=a.action,
                timestamp=a.timestamp,
                ipAddress=a.ip_address,
                details=a.details,
            )
            for a in activities
        ]

        return UserProfileResponse(
            id=user.id,
            fullName=user.full_name or "Alex Mercer",
            email=user.email,
            phone=user.phone or "+1 (555) 019-2834",
            organization=user.organization or "Cyber Defense & Forensics Labs",
            role=user.role or "Lead DFIR Investigator",
            avatarUrl=user.avatar_url,
            experienceLevel=user.experience_level or "8+ Years Experience",
            certifications=user.certifications or ["CISSP", "GCFA", "GCFE"],
            skills=user.skills or ["PCAP Analysis", "Memory Forensics", "Threat Hunting"],
            isTwoFactorEnabled=user.is_two_factor_enabled,
            recoveryCodes=user.recovery_codes or ["A8F3-9K2L", "7N4P-1M9X"],
            isEmailVerified=user.is_email_verified,
            sessions=session_responses,
            activityLog=activity_responses,
        )

    async def revoke_session(self, user_id: str, session_id: str) -> bool:
        """Revokes an active user session."""
        async with self.session.begin():
            success = await self.users_repo.revoke_session(user_id, session_id)
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Session not found or already revoked.",
                )
            return True
