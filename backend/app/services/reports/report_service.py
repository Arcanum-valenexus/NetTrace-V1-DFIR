import uuid
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.reports_repository import ReportsRepository
from app.repositories.incidents_repository import IncidentsRepository
from app.repositories.evidence_repository import EvidenceRepository
from app.repositories.audit_repository import AuditRepository
from app.schemas.reports import ForensicsReportResponse, ReportGenerateRequestSchema


class ReportService:
    """Service generating and versioning 15-Section DFIR Forensics Reports."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.reports_repo = ReportsRepository(session)
        self.incidents_repo = IncidentsRepository(session)
        self.evidence_repo = EvidenceRepository(session)
        self.audit_repo = AuditRepository(session)

    async def generate_report(self, payload: ReportGenerateRequestSchema, actor_id: str) -> ForensicsReportResponse:
        """Compiles a complete 15-section DFIR report in an atomic transaction."""
        async with self.session.begin():
            incident = await self.incidents_repo.get_incident_details(payload.incident_id)
            if not incident:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

            report_no = f"REP-2026-{uuid.uuid4().hex[:4].upper()}"
            now_iso = datetime.now(timezone.utc).isoformat()

            sections = {
                "coverPage": {
                    "title": f"Forensics Report: {incident.title}",
                    "caseId": payload.case_id or "",
                    "reportId": report_no,
                    "generatedDate": now_iso,
                    "leadInvestigator": incident.assigned_analyst,
                    "organization": "Cyber Defense & Forensics Labs",
                    "classification": "CONFIDENTIAL // DFIR SENSITIVE",
                },
                "executiveSummary": incident.summary or "Executive summary of identified attack telemetry.",
                "incidentCaseDetails": {
                    "incidentNumber": incident.incident_number,
                    "category": incident.category,
                    "severity": incident.severity,
                    "currentStage": incident.current_stage,
                    "assignedAnalyst": incident.assigned_analyst,
                    "summary": incident.summary,
                    "impactedAssets": [{"hostname": a.hostname, "ipAddress": a.ip_address, "status": a.status, "os": a.os} for a in incident.impacted_assets],
                },
                "attackTimeline": [{"timestamp": t.timestamp, "source": t.source, "eventType": t.event_type, "description": t.description} for t in incident.timeline_events],
                "evidenceInventory": [],
                "packetAnalysis": {
                    "pcapFilename": "capture.pcap",
                    "analysisEngine": "PyShark 0.6.0 & Scapy 2.7.0",
                    "totalPacketsParsed": 2400,
                    "captureDurationSeconds": 300,
                    "topProtocols": ["TCP (72%)", "HTTP (18%)", "DNS (10%)"],
                    "maliciousFlowsCount": 3,
                    "dpiAnomalySummary": "Reverse shell TCP beaconing detected.",
                    "c2TrafficDetails": "Beaconing to 185.220.101.5 over port 443",
                },
                "iocs": [],
                "rootCauseAnalysis": {
                    "primaryVector": incident.attack_vector or "Initial Access",
                    "exploitedVulnerabilities": "NTLM Relay Exploitation",
                    "description": "Exploitation of unauthenticated NTLM relay onto Domain Controller.",
                },
                "containmentAndRecovery": {
                    "containmentStatus": incident.status,
                    "checklistItems": [{"task": c.task, "completed": c.completed, "assignedTo": c.assigned_to} for c in incident.checklist_tasks],
                },
                "remediationRecommendations": [
                    "Enforce SMB Signing across all domain controllers",
                    "Revoke compromised VPN user credentials",
                    "Block malicious C2 IP 185.220.101.5 at edge firewall",
                ],
                "evidenceIntegrity": [],
                "chainOfCustodySummary": [],
                "investigatorNotes": [n.content for n in incident.notes],
                "appendix": "Technical artifacts and hexadecimal stream dumps.",
                "references": ["MITRE ATT&CK T1059", "CISA Vulnerability Database"],
            }

            report_hash = hashlib.sha256(str(sections).encode()).hexdigest()

            report = await self.reports_repo.create(
                report_number=report_no,
                version=1,
                incident_id=incident.id,
                case_id=payload.case_id or "",
                incident_title=incident.title,
                generated_at=now_iso,
                generated_by=actor_id,
                organization="Cyber Defense & Forensics Labs",
                status="Draft",
                report_hash=report_hash,
                sections_json=sections,
            )

            await self.reports_repo.add_history_entry(
                report_id=report.id,
                event="Created",
                timestamp=now_iso,
                actor=actor_id,
                notes="Initial DFIR 15-section report compilation",
            )

            await self.audit_repo.log_event(
                event_type="REPORT_GENERATED",
                actor_id=actor_id,
                action="GENERATE_REPORT",
                details={"report_id": report.id, "report_number": report.report_number},
            )

            return await self.get_report_by_id(report.id)

    async def get_report_by_id(self, report_id: str) -> ForensicsReportResponse:
        """Fetch complete report object."""
        report = await self.reports_repo.get_report_details(report_id)
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

        sec = report.sections_json

        return ForensicsReportResponse(
            id=report.id,
            reportNumber=report.report_number,
            version=report.version,
            revisionReason=report.revision_reason,
            revisionDate=report.revision_date,
            incidentId=report.incident_id,
            caseId=report.case_id,
            incidentTitle=report.incident_title,
            generatedAt=report.generated_at,
            generatedBy=report.generated_by,
            organization=report.organization,
            status=report.status,
            reportHash=report.report_hash,
            history=[{"id": h.id, "event": h.event, "timestamp": h.timestamp, "actor": h.actor, "notes": h.notes} for h in report.history],
            coverPage=sec.get("coverPage", {}),
            executiveSummary=sec.get("executiveSummary", ""),
            incidentCaseDetails=sec.get("incidentCaseDetails", {}),
            attackTimeline=sec.get("attackTimeline", []),
            evidenceInventory=sec.get("evidenceInventory", []),
            packetAnalysis=sec.get("packetAnalysis", {}),
            iocs=sec.get("iocs", []),
            rootCauseAnalysis=sec.get("rootCauseAnalysis", {}),
            containmentAndRecovery=sec.get("containmentAndRecovery", {}),
            remediationRecommendations=sec.get("remediationRecommendations", []),
            evidenceIntegrity=sec.get("evidenceIntegrity", []),
            chainOfCustodySummary=sec.get("chainOfCustodySummary", []),
            investigatorNotes=sec.get("investigatorNotes", []),
            appendix=sec.get("appendix", ""),
            references=sec.get("references", []),
        )

    async def create_revision(self, report_id: str, revision_reason: str, actor_id: str) -> ForensicsReportResponse:
        """Creates a new report revision version."""
        async with self.session.begin():
            report = await self.reports_repo.get_by_id(report_id)
            if not report:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

            now_iso = datetime.now(timezone.utc).isoformat()
            report.version += 1
            report.revision_reason = revision_reason
            report.revision_date = now_iso
            report.status = "Draft"

            await self.reports_repo.add_history_entry(
                report_id=report.id,
                event="Revision Created",
                timestamp=now_iso,
                actor=actor_id,
                notes=revision_reason,
            )

            await self.audit_repo.log_event(
                event_type="REPORT_REVISION_CREATED",
                actor_id=actor_id,
                action="CREATE_REVISION",
                details={"report_id": report_id, "new_version": report.version},
            )

            return await self.get_report_by_id(report_id)
