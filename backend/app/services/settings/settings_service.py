from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.settings_repository import SettingsRepository
from app.schemas.settings import PlatformPreferencesSchema


class SettingsService:
    """Service managing Analyst Platform Preferences."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.settings_repo = SettingsRepository(session)

    async def get_user_settings(self, user_id: str) -> PlatformPreferencesSchema:
        """Fetch user platform preferences."""
        settings_obj = await self.settings_repo.get_or_create_settings(user_id)
        return PlatformPreferencesSchema(
            theme=settings_obj.theme,
            language=settings_obj.language,
            timezone=settings_obj.timezone,
            beginnerMode=settings_obj.beginner_mode,
            notificationPreferences=settings_obj.notification_preferences,
            accessibilityPreferences=settings_obj.accessibility_preferences,
            privacyPreferences=settings_obj.privacy_preferences,
            defaultLandingPage=settings_obj.default_landing_page,
            defaultExportFormat=settings_obj.default_export_format,
            timeFormat=settings_obj.time_format,
            autoSaveEnabled=settings_obj.auto_save_enabled,
        )

    async def update_user_settings(self, user_id: str, updated_fields: Dict[str, Any]) -> PlatformPreferencesSchema:
        """Update platform preferences inside an atomic transaction."""
        async with self.session.begin():
            settings_obj = await self.settings_repo.get_or_create_settings(user_id)
            for k, v in updated_fields.items():
                if hasattr(settings_obj, k) and v is not None:
                    setattr(settings_obj, k, v)
            await self.session.flush()
            return await self.get_user_settings(user_id)
