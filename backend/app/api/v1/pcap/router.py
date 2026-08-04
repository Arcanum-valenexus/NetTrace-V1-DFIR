from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user_token, require_permissions
from app.core.security import TokenData, PermissionEnum
from app.services.pcap_service import PcapService
from app.schemas.pcap import (
    PcapUploadResponseSchema,
    PcapSessionResponseSchema,
    PacketListResponseSchema,
    PacketDetailResponseSchema,
)
from app.schemas.base import ResponseEnvelope

router = APIRouter(prefix="/pcap", tags=["PCAP Analysis Engine"])


@router.post("/analyze", response_model=ResponseEnvelope[PcapUploadResponseSchema], status_code=status.HTTP_201_CREATED, summary="Upload & Ingest PCAP File")
async def analyze_pcap(
    file: UploadFile = File(...),
    caseId: str = Form("case-001"),
    incidentId: str = Form("inc-001"),
    token_data: TokenData = Depends(require_permissions([PermissionEnum.EVIDENCE_UPLOAD])),
    db: AsyncSession = Depends(get_db)
):
    """Ingests PCAP trace file, validates .pcap/.pcapng extension, saves evidence artifact, runs Scapy dissection, and creates PCAP session."""
    pcap_service = PcapService(db)
    uploader = token_data.email or token_data.sub
    session_data = await pcap_service.create_upload_session(
        file=file,
        case_id=caseId,
        incident_id=incidentId,
        uploader=uploader,
        actor_id=token_data.sub,
    )
    return ResponseEnvelope(success=True, data=session_data)


@router.get("/sessions", response_model=ResponseEnvelope[List[PcapSessionResponseSchema]], summary="List PCAP Sessions")
async def list_pcap_sessions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    token_data: TokenData = Depends(require_permissions([PermissionEnum.CASES_READ])),
    db: AsyncSession = Depends(get_db)
):
    """Lists all active PCAP sessions."""
    pcap_service = PcapService(db)
    sessions = await pcap_service.list_sessions(skip=skip, limit=limit)
    return ResponseEnvelope(success=True, data=sessions)


@router.get("/sessions/{session_id}", response_model=ResponseEnvelope[PcapSessionResponseSchema], summary="Get PCAP Session Details")
async def get_pcap_session(
    session_id: str,
    token_data: TokenData = Depends(require_permissions([PermissionEnum.CASES_READ])),
    db: AsyncSession = Depends(get_db)
):
    """Fetches details for a specific PCAP session."""
    pcap_service = PcapService(db)
    session_data = await pcap_service.get_session(session_id)
    return ResponseEnvelope(success=True, data=session_data)


@router.get("/sessions/{session_id}/packets", response_model=ResponseEnvelope[PacketListResponseSchema], summary="List Packets for PCAP Session")
async def list_pcap_packets(
    session_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    token_data: TokenData = Depends(require_permissions([PermissionEnum.CASES_READ])),
    db: AsyncSession = Depends(get_db)
):
    """Lists packets for a PCAP session."""
    pcap_service = PcapService(db)
    packet_data = await pcap_service.list_packets(session_id=session_id, skip=skip, limit=limit)
    return ResponseEnvelope(success=True, data=packet_data)


@router.get("/sessions/{session_id}/packets/{packetNumber}", response_model=ResponseEnvelope[PacketDetailResponseSchema], summary="Get Packet Details & Payload Hex/ASCII")
async def get_packet_detail(
    session_id: str,
    packetNumber: int = Path(..., ge=1),
    token_data: TokenData = Depends(require_permissions([PermissionEnum.CASES_READ])),
    db: AsyncSession = Depends(get_db)
):
    """Fetches detailed packet metadata along with Hex and ASCII payload streams."""
    pcap_service = PcapService(db)
    packet_detail = await pcap_service.get_packet_detail(session_id=session_id, packet_number=packetNumber)
    return ResponseEnvelope(success=True, data=packet_detail)
