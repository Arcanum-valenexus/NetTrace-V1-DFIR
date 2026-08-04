import re
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Set
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.ioc_repository import IOCRepository
from app.repositories.pcap_repository import PcapRepository
from app.repositories.timeline_repository import TimelineRepository
from app.repositories.audit_repository import AuditRepository
from app.repositories.evidence_repository import EvidenceRepository
from app.models.ioc import IOCModel
from app.schemas.ioc import (
    IOCCreateSchema,
    IOCStatusUpdateSchema,
    IOCResponseSchema,
    IOCListResponseSchema,
)


class IOCService:
    """Service handling Indicator of Compromise (IOC) extraction from packet payloads, lifecycle management, and forensic integration."""

    IPV4_REGEX = re.compile(r'\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b')
    IPV6_REGEX = re.compile(r'\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b')
    DOMAIN_REGEX = re.compile(r'\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:com|net|org|io|gov|edu|info|biz|ru|cn|xyz|online|site|top|cc|me|co)\b', re.IGNORECASE)
    URL_REGEX = re.compile(r'https?://[^\s<>"\'{}|\^~\[\]`]+', re.IGNORECASE)
    EMAIL_REGEX = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
    MD5_REGEX = re.compile(r'\b[a-fA-F0-9]{32}\b')
    SHA1_REGEX = re.compile(r'\b[a-fA-F0-9]{40}\b')
    SHA256_REGEX = re.compile(r'\b[a-fA-F0-9]{64}\b')
    WIN_PATH_REGEX = re.compile(r'\b[a-zA-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]+\b')
    LINUX_PATH_REGEX = re.compile(r'/(?:bin|etc|tmp|usr|var|home|opt)/(?:[a-zA-Z0-9._-]+/)*[a-zA-Z0-9._-]+')
    REG_KEY_REGEX = re.compile(r'\b(?:HKLM|HKCU|HKEY_LOCAL_MACHINE|HKEY_CURRENT_USER)\\[a-zA-Z0-9_\\\-]+\b', re.IGNORECASE)
    HOSTNAME_REGEX = re.compile(r'\b[a-zA-Z0-9\-]{3,63}\.(?:local|internal|corp|lan)\b', re.IGNORECASE)

    IGNORED_IPS = {"0.0.0.0", "127.0.0.1", "255.255.255.255"}

    def __init__(self, session: AsyncSession):
        self.session = session
        self.ioc_repo = IOCRepository(session)
        self.pcap_repo = PcapRepository(session)
        self.timeline_repo = TimelineRepository(session)
        self.audit_repo = AuditRepository(session)
        self.evidence_repo = EvidenceRepository(session)

    async def extract_iocs_from_session(
        self,
        session_id: str,
        case_id: Optional[str] = None,
        incident_id: Optional[str] = None,
        actor_id: str = "System Analyst"
    ) -> List[IOCResponseSchema]:
        """Extracts, deduplicates, and persists IOCs from parsed PCAP packet payloads."""
        session_obj = await self.pcap_repo.get_session(session_id)
        if not session_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"PCAP session with ID '{session_id}' was not found.",
            )

        target_case_id = case_id or "case-001"
        target_incident_id = incident_id or "inc-001"
        evidence_id = session_obj.evidence_id

        if evidence_id:
            evidence = await self.evidence_repo.get_by_id(evidence_id)
            if evidence:
                target_case_id = evidence.case_id or target_case_id
                target_incident_id = evidence.incident_id or target_incident_id

        now_iso = datetime.now(timezone.utc).isoformat()

        # 1. Log Timeline Event: IOC Extraction Started
        await self.timeline_repo.create_pcap_event(
            event_type="IOC Extraction Started",
            description=f"Automated pattern extraction for IOCs initiated for session '{session_id}'.",
            user=actor_id,
            case_id=target_case_id,
            incident_id=target_incident_id,
            evidence_id=evidence_id,
            session_id=session_id,
            severity="Info",
        )

        packets = await self.pcap_repo.list_packets(session_id, skip=0, limit=10000)
        extracted_iocs_data: List[dict] = []
        seen_keys: Set[str] = set()

        for pkt in packets:
            text_sources = [
                pkt.source_ip,
                pkt.destination_ip,
                pkt.info or "",
                pkt.payload_ascii or "",
            ]
            combined_text = " ".join(text_sources)

            # Match patterns
            matches = []
            
            # IPv4
            for ip in self.IPV4_REGEX.findall(combined_text):
                if ip not in self.IGNORED_IPS and not ip.startswith("127."):
                    severity = "High" if ("malicious" in (pkt.info or "").lower() or pkt.destination_port in (4444, 8888, 6667)) else "Medium"
                    matches.append(("IPv4", ip, severity, 0.85))

            # IPv6
            for ip6 in self.IPV6_REGEX.findall(combined_text):
                matches.append(("IPv6", ip6, "Medium", 0.80))

            # Domains
            for dom in self.DOMAIN_REGEX.findall(combined_text):
                dom_clean = dom.lower().strip()
                severity = "Critical" if ("c2" in dom_clean or "malicious" in dom_clean or "phish" in dom_clean) else "Medium"
                matches.append(("Domain", dom_clean, severity, 0.90))

            # URLs
            for url in self.URL_REGEX.findall(combined_text):
                matches.append(("URL", url, "High", 0.88))

            # Emails
            for email in self.EMAIL_REGEX.findall(combined_text):
                matches.append(("Email", email, "Medium", 0.75))

            # Hashes
            for md5 in self.MD5_REGEX.findall(combined_text):
                matches.append(("MD5", md5, "High", 0.95))
            for sha1 in self.SHA1_REGEX.findall(combined_text):
                matches.append(("SHA1", sha1, "High", 0.95))
            for sha256 in self.SHA256_REGEX.findall(combined_text):
                matches.append(("SHA256", sha256, "High", 0.98))

            # File Paths
            for win_p in self.WIN_PATH_REGEX.findall(combined_text):
                matches.append(("FilePath", win_p, "Medium", 0.70))
            for lin_p in self.LINUX_PATH_REGEX.findall(combined_text):
                matches.append(("FilePath", lin_p, "Medium", 0.70))

            # Registry Keys
            for reg_k in self.REG_KEY_REGEX.findall(combined_text):
                matches.append(("RegistryKey", reg_k, "High", 0.90))

            # Hostnames
            for host_n in self.HOSTNAME_REGEX.findall(combined_text):
                matches.append(("Hostname", host_n, "Low", 0.65))

            for ioc_type, val, sev, conf in matches:
                dedup_key = f"{ioc_type}:{val}"
                if dedup_key not in seen_keys:
                    seen_keys.add(dedup_key)
                    extracted_iocs_data.append({
                        "type": ioc_type,
                        "value": val,
                        "status": "Active",
                        "category": "Network Telemetry",
                        "description": f"Extracted from packet #{pkt.packet_number} ({pkt.protocol})",
                        "source_packet": pkt.packet_number,
                        "source_session": session_id,
                        "evidence_id": evidence_id,
                        "incident_id": target_incident_id,
                        "case_id": target_case_id,
                        "severity": sev,
                        "confidence": conf,
                        "first_seen": pkt.timestamp or now_iso,
                        "last_seen": pkt.timestamp or now_iso,
                    })

        # Bulk save IOCs
        created_objs = []
        if extracted_iocs_data:
            created_objs = await self.ioc_repo.bulk_create_iocs(extracted_iocs_data)

        # 2. Log Timeline Event: IOC Extraction Completed
        await self.timeline_repo.create_pcap_event(
            event_type="IOC Extraction Completed",
            description=f"Extracted {len(created_objs)} unique Indicators of Compromise from session trace.",
            user=actor_id,
            case_id=target_case_id,
            incident_id=target_incident_id,
            evidence_id=evidence_id,
            session_id=session_id,
            severity="Info",
        )

        return [self._map_model_to_schema(ioc) for ioc in created_objs]

    async def list_iocs(
        self,
        type: Optional[str] = None,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        session: Optional[str] = None,
        incident: Optional[str] = None,
        case: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> IOCListResponseSchema:
        """List active IOC records with optional filters."""
        iocs = await self.ioc_repo.list_iocs(
            type=type, status=status, severity=severity, session=session, incident=incident, case=case, skip=skip, limit=limit
        )
        return IOCListResponseSchema(
            totalCount=len(iocs),
            iocs=[self._map_model_to_schema(ioc) for ioc in iocs]
        )

    async def get_ioc(self, ioc_id: str) -> IOCResponseSchema:
        """Fetch single IOC details by ID."""
        ioc = await self.ioc_repo.get_ioc(ioc_id)
        if not ioc or ioc.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"IOC record with ID '{ioc_id}' was not found.",
            )
        return self._map_model_to_schema(ioc)

    async def update_status(self, ioc_id: str, new_status: str, actor_id: str = "Analyst") -> IOCResponseSchema:
        """Updates IOC lifecycle status and logs timeline event."""
        valid_statuses = {"Active", "Investigating", "Whitelisted", "Blocked"}
        if new_status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status '{new_status}'. Allowed values: {list(valid_statuses)}",
            )

        ioc = await self.ioc_repo.update_status(ioc_id, new_status)
        if not ioc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"IOC record with ID '{ioc_id}' was not found.",
            )

        # Log Timeline Event
        await self.timeline_repo.create_pcap_event(
            event_type="IOC Status Changed",
            description=f"IOC '{ioc.value}' ({ioc.type}) status transitioned to '{new_status}'.",
            user=actor_id,
            case_id=ioc.case_id or "case-001",
            incident_id=ioc.incident_id or "inc-001",
            evidence_id=ioc.evidence_id,
            session_id=ioc.source_session,
            severity="Info",
        )

        return self._map_model_to_schema(ioc)

    async def delete_ioc(self, ioc_id: str, actor_id: str = "Analyst") -> bool:
        """Soft-deletes IOC record and logs timeline event."""
        ioc = await self.ioc_repo.get_ioc(ioc_id)
        if not ioc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"IOC record with ID '{ioc_id}' was not found.",
            )

        success = await self.ioc_repo.delete_ioc(ioc_id, deleted_by=actor_id)

        # Log Timeline Event
        await self.timeline_repo.create_pcap_event(
            event_type="IOC Deleted",
            description=f"IOC '{ioc.value}' ({ioc.type}) was deleted.",
            user=actor_id,
            case_id=ioc.case_id or "case-001",
            incident_id=ioc.incident_id or "inc-001",
            evidence_id=ioc.evidence_id,
            session_id=ioc.source_session,
            severity="Medium",
        )
        return success

    @staticmethod
    def _map_model_to_schema(ioc: IOCModel) -> IOCResponseSchema:
        return IOCResponseSchema(
            id=ioc.id,
            type=ioc.type,
            value=ioc.value,
            status=ioc.status,
            category=ioc.category,
            description=ioc.description,
            sourcePacket=ioc.source_packet,
            sourceSession=ioc.source_session,
            evidenceId=ioc.evidence_id,
            incidentId=ioc.incident_id,
            caseId=ioc.case_id,
            severity=ioc.severity,
            confidence=ioc.confidence,
            firstSeen=ioc.first_seen,
            lastSeen=ioc.last_seen,
            createdAt=ioc.created_at.isoformat() if hasattr(ioc.created_at, 'isoformat') else str(ioc.created_at),
            updatedAt=ioc.updated_at.isoformat() if hasattr(ioc.updated_at, 'isoformat') else str(ioc.updated_at),
        )
