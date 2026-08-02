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
