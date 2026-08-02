from typing import List, Optional
from sqlalchemy import String, Text, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, BaseModelMixin, SoftDeleteMixin


class ForensicsReportModel(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "forensics_reports"

    report_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    revision_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    revision_date: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    incident_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    case_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    incident_title: Mapped[str] = mapped_column(String(255), nullable=False)
    generated_at: Mapped[str] = mapped_column(String(100), nullable=False)
    generated_by: Mapped[str] = mapped_column(String(255), nullable=False)
    organization: Mapped[str] = mapped_column(String(255), default="Cyber Defense & Forensics Labs")
    status: Mapped[str] = mapped_column(String(50), default="Draft", index=True)  # Draft | Compiled | Ready For Review | Final | Locked
    report_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    
    # 15 Standardized DFIR Sections stored in structured JSON
    sections_json: Mapped[dict] = mapped_column(JSON, nullable=False)

    history: Mapped[List["ReportHistoryModel"]] = relationship("ReportHistoryModel", back_populates="report", cascade="all, delete-orphan")


class ReportHistoryModel(Base, BaseModelMixin):
    __tablename__ = "report_history"

    report_id: Mapped[str] = mapped_column(String(36), ForeignKey("forensics_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    event: Mapped[str] = mapped_column(String(100), nullable=False)  # Created | Compiled | Reviewed | Finalized | Exported
    timestamp: Mapped[str] = mapped_column(String(100), nullable=False)
    actor: Mapped[str] = mapped_column(String(255), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    report: Mapped["ForensicsReportModel"] = relationship("ForensicsReportModel", back_populates="history")
