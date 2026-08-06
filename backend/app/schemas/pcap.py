from typing import Any, Dict, List, Optional
from app.schemas.base import BaseSchema


class PCAPAnalysisRequest(BaseSchema):
    pcap_id: str
    deep_inspection: bool = True


class PCAPPacketDetail(BaseSchema):
    packet_index: int
    timestamp: str
    src_ip: str
    dst_ip: str
    protocol: str
    length: int
    info: str


class PCAPAnalysisResponse(BaseSchema):
    status: str = "success"
    filename: str
    size_bytes: int
    total_packets: int
    suspicious_detections: List[Dict[str, Any]] = []


class PcapUploadResponseSchema(BaseSchema):
    sessionId: str
    filename: str
    originalFilename: str
    fileSizeBytes: int
    uploadTime: str
    uploadedBy: str
    status: str
    evidenceId: Optional[str] = None


class PcapSessionResponseSchema(BaseSchema):
    id: str
    filename: str
    originalFilename: str
    fileSizeBytes: int
    uploadTime: str
    uploadedBy: str
    evidenceId: Optional[str] = None
    status: str
    analysisEngine: str
    packetCount: int
    durationSeconds: float
    topProtocols: List[Dict[str, Any]] = []
    analysisSummary: Dict[str, Any] = {}


class PacketResponseSchema(BaseSchema):
    id: str
    sessionId: str
    packetNumber: int
    timestamp: str
    protocol: str
    sourceIp: str
    destinationIp: str
    sourcePort: Optional[int] = None
    destinationPort: Optional[int] = None
    packetLength: int
    info: Optional[str] = None
    tcpFlags: Optional[str] = None
    payloadHex: Optional[str] = None
    payloadAscii: Optional[str] = None


class PacketDetailResponseSchema(PacketResponseSchema):
    payloadHex: Optional[str] = None
    payloadAscii: Optional[str] = None


class PacketListResponseSchema(BaseSchema):
    sessionId: str
    totalPackets: int
    packets: List[PacketResponseSchema]
