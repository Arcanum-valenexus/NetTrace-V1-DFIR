from typing import List, Optional
from sqlalchemy import String, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, BaseModelMixin, SoftDeleteMixin


class IncidentModel(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "incidents"

    incident_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), default="High", index=True)
    status: Mapped[str] = mapped_column(String(50), default="Investigating", index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    assigned_analyst: Mapped[str] = mapped_column(String(255), nullable=False)
    created_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    attack_vector: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    current_stage: Mapped[str] = mapped_column(String(100), default="Initial Access")
    mitre_tactics: Mapped[Optional[list]] = mapped_column(JSON, default=list)

    impacted_assets: Mapped[List["ImpactedAssetModel"]] = relationship("ImpactedAssetModel", back_populates="incident", cascade="all, delete-orphan")
    timeline_events: Mapped[List["TimelineEventModel"]] = relationship("TimelineEventModel", back_populates="incident", cascade="all, delete-orphan")
    notes: Mapped[List["AnalystNoteModel"]] = relationship("AnalystNoteModel", back_populates="incident", cascade="all, delete-orphan")
    checklist_tasks: Mapped[List["ContainmentChecklistModel"]] = relationship("ContainmentChecklistModel", back_populates="incident", cascade="all, delete-orphan")


class ImpactedAssetModel(Base, BaseModelMixin):
    __tablename__ = "impacted_assets"

    incident_id: Mapped[str] = mapped_column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    hostname: Mapped[str] = mapped_column(String(255), nullable=False)
    ip_address: Mapped[str] = mapped_column(String(100), nullable=False)
    os: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mac_address: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    asset_type: Mapped[str] = mapped_column(String(100), default="Workstation")
    status: Mapped[str] = mapped_column(String(50), default="Under Analysis")  # Isolated | Active | Under Analysis
    owner: Mapped[str] = mapped_column(String(255), default="SOC Operations")

    incident: Mapped["IncidentModel"] = relationship("IncidentModel", back_populates="impacted_assets")


class TimelineEventModel(Base, BaseModelMixin):
    __tablename__ = "timeline_events"

    incident_id: Mapped[str] = mapped_column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp: Mapped[str] = mapped_column(String(100), nullable=False)
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(50), default="Medium")
    raw_log: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    associated_iocs: Mapped[Optional[list]] = mapped_column(JSON, default=list)
    threat_actor: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    incident: Mapped["IncidentModel"] = relationship("IncidentModel", back_populates="timeline_events")


class AnalystNoteModel(Base, BaseModelMixin):
    __tablename__ = "analyst_notes"

    incident_id: Mapped[str] = mapped_column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    author: Mapped[str] = mapped_column(String(255), nullable=False)
    timestamp: Mapped[str] = mapped_column(String(100), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    incident: Mapped["IncidentModel"] = relationship("IncidentModel", back_populates="notes")


class ContainmentChecklistModel(Base, BaseModelMixin):
    __tablename__ = "containment_checklist"

    incident_id: Mapped[str] = mapped_column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    task: Mapped[str] = mapped_column(Text, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    assigned_to: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    incident: Mapped["IncidentModel"] = relationship("IncidentModel", back_populates="checklist_tasks")
