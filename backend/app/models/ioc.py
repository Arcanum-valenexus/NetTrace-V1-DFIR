from typing import Optional
from sqlalchemy import String, Text, Integer, Float, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, BaseModelMixin, SoftDeleteMixin


class IOCModel(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "iocs"

    type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    value: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), default="Active", index=True)
    category: Mapped[str] = mapped_column(String(100), default="Network Telemetry", index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    source_packet: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    source_session: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("pcap_sessions.id", ondelete="CASCADE"), nullable=True, index=True)
    evidence_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("evidence_artifacts.id", ondelete="SET NULL"), nullable=True, index=True)
    incident_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True, index=True)
    case_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)

    severity: Mapped[str] = mapped_column(String(50), default="Medium", index=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.8)
    first_seen: Mapped[str] = mapped_column(String(100), nullable=False)
    last_seen: Mapped[str] = mapped_column(String(100), nullable=False)
