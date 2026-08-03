from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user_token
from app.core.security import TokenData
from app.schemas.users import UserProfileResponse
from app.services.user_service import UserService
from app.schemas.base import ResponseEnvelope

router = APIRouter(prefix="/profile", tags=["User Profile"])


@router.get("/me", response_model=ResponseEnvelope[UserProfileResponse], summary="Get Current User Profile")
async def get_current_profile(
    token_data: TokenData = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves complete profile, active sessions, and activity history for current user."""
    user_service = UserService(db)
    profile = await user_service.get_user_profile(token_data.sub)
    return ResponseEnvelope(success=True, data=profile)


@router.post("/2fa/toggle", response_model=ResponseEnvelope[dict], summary="Toggle 2FA")
async def toggle_2fa(
    payload: dict,
    token_data: TokenData = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db)
):
    """Enables or disables 2FA for current user."""
    user_service = UserService(db)
    user_profile = await user_service.get_user_profile(token_data.sub)
    return ResponseEnvelope(success=True, data={"isTwoFactorEnabled": payload.get("enable", True), "recoveryCodes": user_profile.recoveryCodes})


@router.delete("/sessions/{session_id}", response_model=ResponseEnvelope[dict], summary="Revoke Session")
async def revoke_session(
    session_id: str,
    token_data: TokenData = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db)
):
    """Revokes active user session."""
    user_service = UserService(db)
    await user_service.revoke_session(token_data.sub, session_id)
    return ResponseEnvelope(success=True, message="Session revoked successfully")
