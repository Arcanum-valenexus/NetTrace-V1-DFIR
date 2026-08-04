from typing import List, Optional
from sqlalchemy import String, Integer, Float, BigInteger, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, BaseModelMixin


class PcapSessionModel(Base, BaseModelMixin):
    __tablename__ = "pcap_sessions"

    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    upload_time: Mapped[str] = mapped_column(String(100), nullable=False)
    uploaded_by: Mapped[str] = mapped_column(String(255), nullable=False)
    evidence_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("evidence_artifacts.id", ondelete="SET NULL"), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(50), default="Uploaded", index=True)
    analysis_engine: Mapped[str] = mapped_column(String(100), default="PyShark / Scapy")
    packet_count: Mapped[int] = mapped_column(Integer, default=0)
    duration_seconds: Mapped[float] = mapped_column(Float, default=0.0)
    top_protocols: Mapped[Optional[list]] = mapped_column(JSON, default=list)
    analysis_summary: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)

    packets: Mapped[List["PacketModel"]] = relationship("PacketModel", back_populates="session", cascade="all, delete-orphan")
    extracted_files: Mapped[List["PcapExtractedFileModel"]] = relationship("PcapExtractedFileModel", back_populates="session", cascade="all, delete-orphan")


class PacketModel(Base, BaseModelMixin):
    __tablename__ = "pcap_packets"

    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("pcap_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    packet_number: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    timestamp: Mapped[str] = mapped_column(String(100), nullable=False)
    protocol: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    source_ip: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    destination_ip: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    source_port: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    destination_port: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    packet_length: Mapped[int] = mapped_column(Integer, nullable=False)
    info: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tcp_flags: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    payload_hex: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    payload_ascii: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    session: Mapped["PcapSessionModel"] = relationship("PcapSessionModel", back_populates="packets")


class PcapExtractedFileModel(Base, BaseModelMixin):
    __tablename__ = "pcap_extracted_files"

    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("pcap_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    storage_path: Mapped[str] = mapped_column(Text, nullable=False)
    extracted_at: Mapped[str] = mapped_column(String(100), nullable=False)

    session: Mapped["PcapSessionModel"] = relationship("PcapSessionModel", back_populates="extracted_files")
