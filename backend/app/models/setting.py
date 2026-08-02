from typing import Optional
from sqlalchemy import String, Boolean, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, BaseModelMixin


class PlatformSettingModel(Base, BaseModelMixin):
    __tablename__ = "platform_settings"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    theme: Mapped[str] = mapped_column(String(50), default="cyber-dark")
    language: Mapped[str] = mapped_column(String(50), default="en-US")
    timezone: Mapped[str] = mapped_column(String(100), default="UTC")
    beginner_mode: Mapped[bool] = mapped_column(Boolean, default=False)
    notification_preferences: Mapped[dict] = mapped_column(JSON, default=dict)
    accessibility_preferences: Mapped[dict] = mapped_column(JSON, default=dict)
    privacy_preferences: Mapped[dict] = mapped_column(JSON, default=dict)
    default_landing_page: Mapped[str] = mapped_column(String(50), default="dashboard")
    default_export_format: Mapped[str] = mapped_column(String(50), default="PDF")
    time_format: Mapped[str] = mapped_column(String(50), default="24 Hour")
    auto_save_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
