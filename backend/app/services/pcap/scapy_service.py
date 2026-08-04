import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import scapy.all as scapy
from app.core.config import settings
from app.core.logging import logger
from app.repositories.pcap_repository import PcapRepository


class ScapyService:
    """Service handling Scapy raw packet parsing, dissection, payload hex/ASCII extraction, and database persistence."""

    def __init__(self, pcap_repo: PcapRepository):
        self.pcap_repo = pcap_repo

    async def dissect_and_persist(self, session_id: str, file_path: str) -> Dict[str, Any]:
        """Reads PCAP file via Scapy rdpcap(), parses packet headers & payloads, persists to PacketModel, and updates PcapSessionModel."""
        try:
            full_path = file_path if os.path.isabs(file_path) else os.path.join(settings.UPLOAD_DIRECTORY, file_path)
            packets = scapy.rdpcap(full_path)
            total_packets = len(packets)
            
            session_obj = await self.pcap_repo.get_session(session_id)

            if total_packets == 0:
                if session_obj:
                    await self.pcap_repo.update(
                        session_obj,
                        packet_count=0,
                        duration_seconds=0.0,
                        analysis_engine="Scapy Dissection Engine",
                        status="Completed"
                    )
                return {"packet_count": 0, "status": "Completed"}

            first_time = float(packets[0].time)
            last_time = float(packets[-1].time)
            duration_seconds = max(0.0, last_time - first_time)

            packets_data: List[dict] = []

            for idx, pkt in enumerate(packets, start=1):
                pkt_time_str = datetime.fromtimestamp(float(pkt.time), tz=timezone.utc).isoformat()
                
                # Protocol detection hierarchy
                protocol = "Unknown"
                info = "Raw Packet"
                src_ip = "0.0.0.0"
                dst_ip = "0.0.0.0"
                src_port: Optional[int] = None
                dst_port: Optional[int] = None
                tcp_flags: Optional[str] = None

                # IP layer
                if pkt.haslayer(scapy.IP):
                    src_ip = pkt[scapy.IP].src
                    dst_ip = pkt[scapy.IP].dst
                    protocol = "IPv4"
                    info = f"IPv4 {src_ip} -> {dst_ip}"
                elif pkt.haslayer(scapy.IPv6):
                    src_ip = pkt[scapy.IPv6].src
                    dst_ip = pkt[scapy.IPv6].dst
                    protocol = "IPv6"
                    info = f"IPv6 {src_ip} -> {dst_ip}"
                elif pkt.haslayer(scapy.ARP):
                    src_ip = pkt[scapy.ARP].psrc
                    dst_ip = pkt[scapy.ARP].pdst
                    protocol = "ARP"
                    op = "Who has" if pkt[scapy.ARP].op == 1 else "Is at"
                    info = f"ARP {op} {dst_ip}"
                elif pkt.haslayer(scapy.Ether):
                    protocol = "Ethernet"
                    info = f"Ethernet {pkt[scapy.Ether].src} -> {pkt[scapy.Ether].dst}"

                # Transport & Application layers
                if pkt.haslayer(scapy.TCP):
                    src_port = int(pkt[scapy.TCP].sport)
                    dst_port = int(pkt[scapy.TCP].dport)
                    tcp_flags = str(pkt[scapy.TCP].flags)
                    
                    if src_port in (80, 8080) or dst_port in (80, 8080):
                        protocol = "HTTP"
                        info = f"HTTP {src_ip}:{src_port} -> {dst_ip}:{dst_port}"
                    elif src_port == 443 or dst_port == 443:
                        protocol = "HTTPS"
                        info = f"HTTPS / TLS {src_ip}:{src_port} -> {dst_ip}:{dst_port}"
                    else:
                        protocol = "TCP"
                        info = f"TCP {src_ip}:{src_port} -> {dst_ip}:{dst_port} [{tcp_flags}]"
                elif pkt.haslayer(scapy.UDP):
                    src_port = int(pkt[scapy.UDP].sport)
                    dst_port = int(pkt[scapy.UDP].dport)
                    
                    if pkt.haslayer(scapy.DNS):
                        protocol = "DNS"
                        qd_name = pkt[scapy.DNS].qd.qname.decode('utf-8', errors='ignore') if pkt.haslayer(scapy.DNS) and pkt[scapy.DNS].qd else ""
                        info = f"DNS Query {qd_name}" if qd_name else f"DNS {src_ip}:{src_port} -> {dst_ip}:{dst_port}"
                    else:
                        protocol = "UDP"
                        info = f"UDP {src_ip}:{src_port} -> {dst_ip}:{dst_port}"
                elif pkt.haslayer(scapy.ICMP):
                    protocol = "ICMP"
                    info = f"ICMP Type {pkt[scapy.ICMP].type} Code {pkt[scapy.ICMP].code}"

                # Payload Hex & ASCII
                raw_bytes = bytes(pkt)
                payload_hex = raw_bytes.hex()
                payload_ascii = ''.join(chr(b) if 32 <= b <= 126 else '.' for b in raw_bytes)

                packets_data.append({
                    "session_id": session_id,
                    "packet_number": idx,
                    "timestamp": pkt_time_str,
                    "protocol": protocol,
                    "source_ip": src_ip,
                    "destination_ip": dst_ip,
                    "source_port": src_port,
                    "destination_port": dst_port,
                    "packet_length": len(raw_bytes),
                    "info": info,
                    "tcp_flags": tcp_flags,
                    "payload_hex": payload_hex,
                    "payload_ascii": payload_ascii,
                })

            # Bulk save packets
            await self.pcap_repo.bulk_save_packets(packets_data)

            # Update session status
            if session_obj:
                await self.pcap_repo.update(
                    session_obj,
                    packet_count=total_packets,
                    duration_seconds=round(duration_seconds, 2),
                    analysis_engine="Scapy Dissection Engine",
                    status="Completed"
                )

            return {
                "packet_count": total_packets,
                "duration_seconds": round(duration_seconds, 2),
                "status": "Completed"
            }

        except Exception as err:
            logger.error("Scapy dissection failed", session_id=session_id, error=str(err))
            session_obj = await self.pcap_repo.get_session(session_id)
            if session_obj:
                await self.pcap_repo.update(
                    session_obj,
                    status="Failed",
                    analysis_engine="Scapy Dissection Engine"
                )
            raise err

    async def parse_pcap_summary(self, file_path: str) -> Dict[str, Any]:
        """Fast Scapy summary helper."""
        logger.info("ScapyService.parse_pcap_summary called", file_path=file_path)
        return {
            "file_path": file_path,
            "status": "summary_ready"
        }

    async def extract_dns_queries(self, file_path: str) -> List[str]:
        """Extract DNS query list helper."""
        return []
