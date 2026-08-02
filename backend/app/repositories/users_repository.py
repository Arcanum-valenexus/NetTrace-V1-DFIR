from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import UserModel, UserSessionModel, LoginHistoryModel, UserActivityModel
from app.repositories.base import BaseRepository


class UsersRepository(BaseRepository[UserModel]):
    """Async repository for User entities, sessions, and activity logs."""

    def __init__(self, session: AsyncSession):
        super().__init__(UserModel, session)

    async def get_by_email(self, email: str) -> Optional[UserModel]:
        """Fetch user by email address."""
        result = await self.session.execute(
            select(UserModel).where(UserModel.email == email)
        )
        return result.scalars().first()

    async def create_user_session(self, **session_data) -> UserSessionModel:
        """Create new active user session."""
        user_session = UserSessionModel(**session_data)
        self.session.add(user_session)
        await self.session.flush()
        return user_session

    async def list_user_sessions(self, user_id: str) -> List[UserSessionModel]:
        """List all sessions for a user."""
        result = await self.session.execute(
            select(UserSessionModel).where(UserSessionModel.user_id == user_id)
        )
        return list(result.scalars().all())

    async def revoke_session(self, user_id: str, session_id: str) -> bool:
        """Revoke a specific user session."""
        result = await self.session.execute(
            select(UserSessionModel).where(
                UserSessionModel.id == session_id,
                UserSessionModel.user_id == user_id
            )
        )
        session_obj = result.scalars().first()
        if session_obj:
            await self.session.delete(session_obj)
            await self.session.flush()
            return True
        return False

    async def create_activity_log(self, **activity_data) -> UserActivityModel:
        """Log user activity event."""
        activity = UserActivityModel(**activity_data)
        self.session.add(activity)
        await self.session.flush()
        return activity

    async def list_activity_logs(self, user_id: str, limit: int = 50) -> List[UserActivityModel]:
        """List user activity history."""
        result = await self.session.execute(
            select(UserActivityModel).where(UserActivityModel.user_id == user_id).limit(limit)
        )
        return list(result.scalars().all())
