from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.setting import PlatformSettingModel
from app.repositories.base import BaseRepository


class SettingsRepository(BaseRepository[PlatformSettingModel]):
    """Async repository for Analyst Platform Settings & Preferences."""

    def __init__(self, session: AsyncSession):
        super().__init__(PlatformSettingModel, session)

    async def get_by_user_id(self, user_id: str) -> Optional[PlatformSettingModel]:
        """Fetch settings for a user."""
        result = await self.session.execute(
            select(PlatformSettingModel).where(PlatformSettingModel.user_id == user_id)
        )
        return result.scalars().first()

    async def get_or_create_settings(self, user_id: str) -> PlatformSettingModel:
        """Get or initialize default settings for user."""
        settings_obj = await self.get_by_user_id(user_id)
        if not settings_obj:
            settings_obj = PlatformSettingModel(
                user_id=user_id,
                theme="cyber-dark",
                language="en-US",
                timezone="UTC",
                beginner_mode=False,
                notification_preferences={
                    "criticalThreatAlerts": {"inApp": True, "email": True},
                    "pcapAnalysisCompleted": {"inApp": True, "email": False},
                    "evidenceVerificationCompleted": {"inApp": True, "email": True},
                    "iocDetectionCompleted": {"inApp": True, "email": False},
                    "forensicReportGenerated": {"inApp": True, "email": True},
                    "investigationAssigned": {"inApp": True, "email": True}
                },
                accessibility_preferences={"reduceMotion": False, "highContrastMode": False},
                privacy_preferences={"zeroLocalPcapTelemetry": True},
                default_landing_page="dashboard",
                default_export_format="PDF",
                time_format="24 Hour",
                auto_save_enabled=True
            )
            self.session.add(settings_obj)
            await self.session.flush()
            await self.session.refresh(settings_obj)
        return settings_obj
