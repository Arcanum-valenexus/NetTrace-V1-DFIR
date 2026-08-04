from datetime import datetime, timezone
from typing import List, Optional
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.file_validation import validate_file_upload, generate_secure_storage_path
from app.services.evidence.hash_service import HashService
from app.services.storage.storage_service import StorageService
from app.repositories.evidence_repository import EvidenceRepository
from app.repositories.audit_repository import AuditRepository
from app.repositories.pcap_repository import PcapRepository
from app.services.pcap.scapy_service import ScapyService
from app.services.pcap.pyshark_service import PySharkService
from app.models.pcap import PcapSessionModel, PacketModel
from app.schemas.pcap import (
    PcapUploadResponseSchema,
    PcapSessionResponseSchema,
    PacketResponseSchema,
    PacketDetailResponseSchema,
    PacketListResponseSchema,
)


class PcapService:
    """Service handling PCAP file uploads, evidence vault linking, Scapy dissection, PyShark deep analysis, and session management."""

    ALLOWED_EXTENSIONS = {".pcap", ".pcapng"}

    def __init__(self, session: AsyncSession):
        self.session = session
        self.pcap_repo = PcapRepository(session)
        self.evidence_repo = EvidenceRepository(session)
        self.audit_repo = AuditRepository(session)

    async def create_upload_session(
        self,
        file: UploadFile,
        case_id: str,
        incident_id: str,
        uploader: str,
        actor_id: str,
    ) -> PcapUploadResponseSchema:
        """Validates PCAP file extension, stores evidence artifact, hashes content, creates PcapSessionModel, and runs Scapy dissection + PyShark deep analysis."""
        filename = file.filename or "capture.pcap"
        ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in self.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file extension '{ext}'. Only .pcap and .pcapng files are permitted.",
            )

        content = await file.read()
        sanitized_filename, _ = validate_file_upload(file, len(content))
        storage_path = generate_secure_storage_path(sanitized_filename, case_id=case_id)

        # Compute SHA256 & MD5
        hashes = HashService.compute_hashes_from_bytes(content)

        # Save file to storage
        storage_service = StorageService()
        await storage_service.save_evidence_file(content, storage_path)

        async with self.session.begin():
            # Create Evidence Artifact
            artifact = await self.evidence_repo.create(
                case_id=case_id,
                incident_id=incident_id,
                name=sanitized_filename,
                category="PCAP Trace",
                description=f"Ingested PCAP forensic capture file ({sanitized_filename}).",
                size_bytes=len(content),
                hash_sha256=hashes["sha256"],
                hash_md5=hashes["md5"],
                uploaded_at=datetime.now(timezone.utc).isoformat(),
                uploaded_by=uploader,
                owner_investigator_id=actor_id,
                owner_investigator_name=uploader,
                storage_path=storage_path,
            )

            # Log Chain of Custody
            await self.evidence_repo.add_custody_entry(
                evidence_id=artifact.id,
                case_id=case_id,
                action="PCAP Evidence Ingested & Hashed",
                actor=uploader,
                investigator_id=actor_id,
                investigator_name=uploader,
                timestamp=artifact.uploaded_at,
                notes=f"SHA256: {hashes['sha256']}",
            )

            # Log Audit Event
            await self.audit_repo.log_event(
                event_type="PCAP_UPLOAD",
                actor_id=actor_id,
                action="UPLOAD_PCAP_EVIDENCE",
                details={"evidence_id": artifact.id, "filename": sanitized_filename, "sha256": hashes["sha256"]},
            )

            # Create PCAP Session
            pcap_session = await self.pcap_repo.create_session(
                filename=sanitized_filename,
                original_filename=filename,
                file_size_bytes=len(content),
                upload_time=artifact.uploaded_at,
                uploaded_by=uploader,
                evidence_id=artifact.id,
                status="Processing",
                analysis_engine="PyShark / Scapy",
                packet_count=0,
                duration_seconds=0.0,
            )

            pcap_session_id = pcap_session.id
            artifact_id = artifact.id

            # Log Timeline Events
            from app.repositories.timeline_repository import TimelineRepository
            timeline_repo = TimelineRepository(self.session)
            await timeline_repo.create_pcap_event(
                event_type="PCAP Uploaded",
                description=f"PCAP forensic capture file ({sanitized_filename}) uploaded to evidence vault.",
                user=uploader,
                case_id=case_id,
                incident_id=incident_id,
                evidence_id=artifact_id,
                session_id=pcap_session_id,
                severity="Info",
            )
            await timeline_repo.create_pcap_event(
                event_type="Analysis Started",
                description=f"Automated Scapy & PyShark packet dissection and deep analysis started.",
                user=uploader,
                case_id=case_id,
                incident_id=incident_id,
                evidence_id=artifact_id,
                session_id=pcap_session_id,
                severity="Info",
            )

        try:
            # 1. Execute Scapy Dissection
            scapy_service = ScapyService(self.pcap_repo)
            async with self.session.begin():
                await scapy_service.dissect_and_persist(pcap_session_id, storage_path)

            # 2. Execute PyShark Deep Analysis / Fallback Enrichment
            pyshark_service = PySharkService(self.pcap_repo)
            async with self.session.begin():
                await pyshark_service.enrich_session_analysis(pcap_session_id, storage_path)

            # 3. Execute Automated IOC Extraction from Packet Payloads
            from app.services.ioc_service import IOCService
            ioc_service = IOCService(self.session)
            async with self.session.begin():
                await ioc_service.extract_iocs_from_session(pcap_session_id, case_id=case_id, incident_id=incident_id, actor_id=uploader)
        except Exception as err:
            async with self.session.begin():
                await self.pcap_repo.update_status(pcap_session_id, "Failed")
                artifact_obj = await self.evidence_repo.get_by_id(artifact_id)
                if artifact_obj:
                    artifact_obj.analysis_status = "Failed"
                timeline_repo = TimelineRepository(self.session)
                await timeline_repo.create_pcap_event(
                    event_type="Analysis Failed",
                    description=f"PCAP packet analysis failed: {str(err)}",
                    user=uploader,
                    case_id=case_id,
                    incident_id=incident_id,
                    evidence_id=artifact_id,
                    session_id=pcap_session_id,
                    severity="High",
                )
            raise err

        updated_session = await self.pcap_repo.get_session(pcap_session_id)

        return PcapUploadResponseSchema(
            sessionId=updated_session.id,
            filename=updated_session.filename,
            originalFilename=updated_session.original_filename,
            fileSizeBytes=updated_session.file_size_bytes,
            uploadTime=updated_session.upload_time,
            uploadedBy=updated_session.uploaded_by,
            status=updated_session.status,
            evidenceId=artifact_id,
        )

    async def get_session(self, session_id: str) -> PcapSessionResponseSchema:
        """Fetch PCAP session metadata by ID along with top protocols and analysis summary."""
        session_obj = await self.pcap_repo.get_session(session_id)
        if not session_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"PCAP session with ID '{session_id}' was not found.",
            )

        return PcapSessionResponseSchema(
            id=session_obj.id,
            filename=session_obj.filename,
            originalFilename=session_obj.original_filename,
            fileSizeBytes=session_obj.file_size_bytes,
            uploadTime=session_obj.upload_time,
            uploadedBy=session_obj.uploaded_by,
            evidenceId=session_obj.evidence_id,
            status=session_obj.status,
            analysisEngine=session_obj.analysis_engine,
            packetCount=session_obj.packet_count,
            durationSeconds=session_obj.duration_seconds,
            topProtocols=session_obj.top_protocols or [],
            analysisSummary=session_obj.analysis_summary or {},
        )

    async def list_sessions(self, skip: int = 0, limit: int = 100) -> List[PcapSessionResponseSchema]:
        """List all active PCAP sessions."""
        sessions = await self.pcap_repo.list_sessions(skip=skip, limit=limit)
        return [
            PcapSessionResponseSchema(
                id=s.id,
                filename=s.filename,
                originalFilename=s.original_filename,
                fileSizeBytes=s.file_size_bytes,
                uploadTime=s.upload_time,
                uploadedBy=s.uploaded_by,
                evidenceId=s.evidence_id,
                status=s.status,
                analysisEngine=s.analysis_engine,
                packetCount=s.packet_count,
                durationSeconds=s.duration_seconds,
                topProtocols=s.top_protocols or [],
                analysisSummary=s.analysis_summary or {},
            )
            for s in sessions
        ]

    async def list_packets(self, session_id: str, skip: int = 0, limit: int = 100) -> PacketListResponseSchema:
        """List packets associated with a PCAP session."""
        session_obj = await self.pcap_repo.get_session(session_id)
        if not session_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"PCAP session with ID '{session_id}' was not found.",
            )

        packets = await self.pcap_repo.list_packets(session_id, skip=skip, limit=limit)
        packet_responses = [
            PacketResponseSchema(
                id=p.id,
                sessionId=p.session_id,
                packetNumber=p.packet_number,
                timestamp=p.timestamp,
                protocol=p.protocol,
                sourceIp=p.source_ip,
                destinationIp=p.destination_ip,
                sourcePort=p.source_port,
                destinationPort=p.destination_port,
                packetLength=p.packet_length,
                info=p.info,
                tcpFlags=p.tcp_flags,
            )
            for p in packets
        ]

        return PacketListResponseSchema(
            sessionId=session_id,
            totalPackets=session_obj.packet_count,
            packets=packet_responses,
        )

    async def get_packet_detail(self, session_id: str, packet_number: int) -> PacketDetailResponseSchema:
        """Fetch detailed packet metadata and Hex/ASCII payload streams."""
        session_obj = await self.pcap_repo.get_session(session_id)
        if not session_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"PCAP session with ID '{session_id}' was not found.",
            )

        packet = await self.pcap_repo.get_packet_by_number(session_id, packet_number)
        if not packet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Packet #{packet_number} was not found in PCAP session '{session_id}'.",
            )

        return PacketDetailResponseSchema(
            id=packet.id,
            sessionId=packet.session_id,
            packetNumber=packet.packet_number,
            timestamp=packet.timestamp,
            protocol=packet.protocol,
            sourceIp=packet.source_ip,
            destinationIp=packet.destination_ip,
            sourcePort=packet.source_port,
            destinationPort=packet.destination_port,
            packetLength=packet.packet_length,
            info=packet.info,
            tcpFlags=packet.tcp_flags,
            payloadHex=packet.payload_hex,
            payloadAscii=packet.payload_ascii,
        )
