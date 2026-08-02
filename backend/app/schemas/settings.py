from typing import Dict, Any
from app.schemas.base import BaseSchema


class PlatformPreferencesSchema(BaseSchema):
    theme: str = "cyber-dark"
    language: str = "en-US"
    timezone: str = "UTC"
    beginnerMode: bool = False
    notificationPreferences: Dict[str, Any] = {}
    accessibilityPreferences: Dict[str, Any] = {}
    privacyPreferences: Dict[str, Any] = {}
    defaultLandingPage: str = "dashboard"
    defaultExportFormat: str = "PDF"
    timeFormat: str = "24 Hour"
    autoSaveEnabled: bool = True
