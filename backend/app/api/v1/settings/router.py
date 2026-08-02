from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user_token
from app.core.security import TokenData
from app.schemas.settings import PlatformPreferencesSchema
from app.services.settings.settings_service import SettingsService
from app.schemas.base import ResponseEnvelope

router = APIRouter(prefix="/settings", tags=["Platform Settings"])


@router.get("", response_model=ResponseEnvelope[PlatformPreferencesSchema], summary="Get Analyst Platform Preferences")
async def get_settings(
    token_data: TokenData = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves user platform settings."""
    settings_service = SettingsService(db)
    settings_data = await settings_service.get_user_settings(token_data.sub or "usr-alex-01")
    return ResponseEnvelope(success=True, data=settings_data)


@router.put("", response_model=ResponseEnvelope[PlatformPreferencesSchema], summary="Update Analyst Platform Preferences")
async def update_settings(
    payload: dict,
    token_data: TokenData = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db)
):
    """Updates analyst platform settings."""
    settings_service = SettingsService(db)
    updated = await settings_service.update_user_settings(token_data.sub or "usr-alex-01", payload)
    return ResponseEnvelope(success=True, data=updated)
