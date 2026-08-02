from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, BaseModelMixin


class UserModel(Base, BaseModelMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    organization: Mapped[Optional[str]] = mapped_column(String(255), default="Cyber Defense & Forensics Labs")
    role: Mapped[str] = mapped_column(String(100), default="Lead DFIR Investigator", index=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    experience_level: Mapped[Optional[str]] = mapped_column(String(100), default="8+ Years Experience")
    certifications: Mapped[Optional[list]] = mapped_column(JSON, default=list)
    skills: Mapped[Optional[list]] = mapped_column(JSON, default=list)
    is_two_factor_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    recovery_codes: Mapped[Optional[list]] = mapped_column(JSON, default=list)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=True)

    sessions: Mapped[List["UserSessionModel"]] = relationship("UserSessionModel", back_populates="user", cascade="all, delete-orphan")
    login_history: Mapped[List["LoginHistoryModel"]] = relationship("LoginHistoryModel", back_populates="user", cascade="all, delete-orphan")
    activities: Mapped[List["UserActivityModel"]] = relationship("UserActivityModel", back_populates="user", cascade="all, delete-orphan")


class UserSessionModel(Base, BaseModelMixin):
    __tablename__ = "user_sessions"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    browser: Mapped[str] = mapped_column(String(255), nullable=False)
    device: Mapped[str] = mapped_column(String(255), nullable=False)
    operating_system: Mapped[str] = mapped_column(String(255), nullable=False)
    ip_address: Mapped[str] = mapped_column(String(100), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    login_time: Mapped[str] = mapped_column(String(100), nullable=False)
    last_active: Mapped[str] = mapped_column(String(100), nullable=False)
    is_current: Mapped[bool] = mapped_column(Boolean, default=True)

    user: Mapped["UserModel"] = relationship("UserModel", back_populates="sessions")


class LoginHistoryModel(Base, BaseModelMixin):
    __tablename__ = "login_history"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date: Mapped[str] = mapped_column(String(50), nullable=False)
    time: Mapped[str] = mapped_column(String(50), nullable=False)
    browser: Mapped[str] = mapped_column(String(255), nullable=False)
    operating_system: Mapped[str] = mapped_column(String(255), nullable=False)
    ip_address: Mapped[str] = mapped_column(String(100), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(100), nullable=False)  # Successful Login | Failed Password
    auth_method: Mapped[str] = mapped_column(String(100), default="Password + 2FA TOTP")

    user: Mapped["UserModel"] = relationship("UserModel", back_populates="login_history")


class UserActivityModel(Base, BaseModelMixin):
    __tablename__ = "user_activities"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    timestamp: Mapped[str] = mapped_column(String(100), nullable=False)
    ip_address: Mapped[str] = mapped_column(String(100), nullable=False)
    details: Mapped[str] = mapped_column(Text, nullable=False)

    user: Mapped["UserModel"] = relationship("UserModel", back_populates="activities")
