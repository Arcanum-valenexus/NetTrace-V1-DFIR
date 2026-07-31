from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="Lead DFIR Investigator")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class IncidentModel(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)
    incident_number = Column(String, unique=True, index=True)
    title = Column(String, nullable=False)
    severity = Column(String, default="High")
    status = Column(String, default="Investigating")
    category = Column(String, nullable=False)
    assigned_analyst = Column(String, nullable=False)
    summary = Column(Text, nullable=True)
    attack_vector = Column(Text, nullable=True)
    current_stage = Column(String, default="Initial Access")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    timeline_events = relationship("TimelineEventModel", back_populates="incident", cascade="all, delete-orphan")
    impacted_assets = relationship("ImpactedAssetModel", back_populates="incident", cascade="all, delete-orphan")

class TimelineEventModel(Base):
    __tablename__ = "timeline_events"

    id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"))
    timestamp = Column(String, nullable=False)
    source = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String, default="Medium")
    raw_log = Column(Text, nullable=True)

    incident = relationship("IncidentModel", back_populates="timeline_events")

class ImpactedAssetModel(Base):
    __tablename__ = "impacted_assets"

    id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"))
    hostname = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    os = Column(String, nullable=True)
    asset_type = Column(String, nullable=True)
    status = Column(String, default="Under Analysis")

    incident = relationship("IncidentModel", back_populates="impacted_assets")

class IOCModel(Base):
    __tablename__ = "iocs"

    id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False)  # ip, domain, hash_sha256, hash_md5, url
    value = Column(String, nullable=False, index=True)
    threat_score = Column(Integer, default=80)
    status = Column(String, default="Active Threat")
    category = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    first_seen = Column(DateTime, default=datetime.datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)

class ReportModel(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, nullable=False)
    incident_title = Column(String, nullable=False)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    generated_by = Column(String, nullable=False)
    status = Column(String, default="Draft")
    executive_summary = Column(Text, nullable=True)
    attack_vector_details = Column(Text, nullable=True)
    containment_status = Column(Text, nullable=True)
