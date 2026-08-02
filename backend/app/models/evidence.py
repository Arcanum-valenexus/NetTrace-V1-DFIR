from typing import List, Optional
from sqlalchemy import String, Text, BigInteger, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, BaseModelMixin, SoftDeleteMixin


class EvidenceArtifactModel(Base, BaseModelMixin, SoftDeleteMixin):
    __tablename__ = "evidence_artifacts"

    case_id: Mapped[str] = mapped_column(String(100), default="CASE-2026-001", index=True)
    incident_id: Mapped[str] = mapped_column(String(100), default="inc-1", index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tags: Mapped[Optional[list]] = mapped_column(JSON, default=list)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    hash_sha256: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    hash_md5: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    uploaded_at: Mapped[str] = mapped_column(String(100), nullable=False)
    uploaded_by: Mapped[str] = mapped_column(String(255), nullable=False)
    owner_investigator_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    owner_investigator_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    access_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    storage_path: Mapped[str] = mapped_column(Text, nullable=False)

    chain_of_custody: Mapped[List["ChainOfCustodyModel"]] = relationship("ChainOfCustodyModel", back_populates="evidence", cascade="all, delete-orphan")


class ChainOfCustodyModel(Base, BaseModelMixin):
    __tablename__ = "chain_of_custody"

    evidence_id: Mapped[str] = mapped_column(String(36), ForeignKey("evidence_artifacts.id", ondelete="CASCADE"), nullable=False, index=True)
    case_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    actor: Mapped[str] = mapped_column(String(255), nullable=False)
    investigator_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    investigator_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    timestamp: Mapped[str] = mapped_column(String(100), nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=False)

    evidence: Mapped["EvidenceArtifactModel"] = relationship("EvidenceArtifactModel", back_populates="chain_of_custody")
