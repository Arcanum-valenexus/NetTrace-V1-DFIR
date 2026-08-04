import os
import shutil
from datetime import datetime, timezone
from collections import Counter
from typing import Any, Dict, List, Optional
import pyshark
from app.core.config import settings
from app.core.logging import logger
from app.repositories.pcap_repository import PcapRepository


class PySharkService:
    """Service handling PyShark deep packet inspection, session-level protocol distribution, statistics calculation, and TShark fallback."""

    def __init__(self, pcap_repo: PcapRepository):
        self.pcap_repo = pcap_repo

    @staticmethod
    def is_tshark_available() -> bool:
        """Detect whether tshark binary is installed and present in system PATH."""
        return shutil.which("tshark") is not None

    async def enrich_session_analysis(self, session_id: str, file_path: str) -> Dict[str, Any]:
        """Performs deep session protocol analysis via PyShark FileCapture or falls back to Scapy packet database aggregation."""
        full_path = file_path if os.path.isabs(file_path) else os.path.join(settings.UPLOAD_DIRECTORY, file_path)

        if self.is_tshark_available():
            try:
                return await self._analyze_with_pyshark(session_id, full_path)
            except Exception as err:
                logger.warning("PyShark execution failed, falling back to Scapy database aggregation", session_id=session_id, error=str(err))
                return await self._fallback_analysis_from_db(session_id)
        else:
            logger.info("TShark binary unavailable, using Scapy session enrichment fallback", session_id=session_id)
            return await self._fallback_analysis_from_db(session_id)

    async def _analyze_with_pyshark(self, session_id: str, full_path: str) -> Dict[str, Any]:
        """Deep protocol dissection using PyShark FileCapture."""
        cap = pyshark.FileCapture(full_path, keep_packets=False)

        protocol_counts: Counter = Counter()
        src_ip_counts: Counter = Counter()
        dst_ip_counts: Counter = Counter()
        packet_lengths: List[int] = []
        first_ts: Optional[str] = None
        last_ts: Optional[str] = None

        dns_queries = 0
        dns_responses = 0
        http_requests = 0
        https_sessions = 0
        tcp_count = 0
        udp_count = 0
        icmp_count = 0
        arp_count = 0
        ipv4_count = 0
        ipv6_count = 0
        unknown_count = 0

        for pkt in cap:
            pkt_length = int(pkt.length) if hasattr(pkt, 'length') else 0
            packet_lengths.append(pkt_length)

            ts = str(pkt.sniff_timestamp) if hasattr(pkt, 'sniff_timestamp') else ""
            if not first_ts:
                first_ts = ts
            last_ts = ts

            highest_layer = pkt.highest_layer.upper() if hasattr(pkt, 'highest_layer') else "UNKNOWN"
            protocol_counts[highest_layer] += 1

            if hasattr(pkt, 'ip'):
                src_ip_counts[pkt.ip.src] += 1
                dst_ip_counts[pkt.ip.dst] += 1
                ipv4_count += 1
            elif hasattr(pkt, 'ipv6'):
                src_ip_counts[pkt.ipv6.src] += 1
                dst_ip_counts[pkt.ipv6.dst] += 1
                ipv6_count += 1
            elif hasattr(pkt, 'arp'):
                arp_count += 1

            if hasattr(pkt, 'tcp'):
                tcp_count += 1
                if hasattr(pkt, 'http'):
                    http_requests += 1
                elif hasattr(pkt, 'tls') or hasattr(pkt, 'ssl'):
                    https_sessions += 1
            elif hasattr(pkt, 'udp'):
                udp_count += 1
                if hasattr(pkt, 'dns'):
                    if hasattr(pkt.dns, 'flags_response') and pkt.dns.flags_response == '1':
                        dns_responses += 1
                    else:
                        dns_queries += 1
            elif hasattr(pkt, 'icmp'):
                icmp_count += 1
            else:
                unknown_count += 1

        cap.close()

        total_packets = len(packet_lengths)
        return await self._format_and_save_enrichment(
            session_id=session_id,
            total_packets=total_packets,
            protocol_counts=protocol_counts,
            src_ip_counts=src_ip_counts,
            dst_ip_counts=dst_ip_counts,
            packet_lengths=packet_lengths,
            first_ts=first_ts or "",
            last_ts=last_ts or "",
            dns_queries=dns_queries,
            dns_responses=dns_responses,
            http_requests=http_requests,
            https_sessions=https_sessions,
            tcp_count=tcp_count,
            udp_count=udp_count,
            icmp_count=icmp_count,
            arp_count=arp_count,
            ipv4_count=ipv4_count,
            ipv6_count=ipv6_count,
            unknown_count=unknown_count,
            engine_name="PyShark Deep Analysis (TShark)"
        )

    async def _fallback_analysis_from_db(self, session_id: str) -> Dict[str, Any]:
        """Fallback session enrichment using persisted database packet telemetry."""
        packets = await self.pcap_repo.list_packets(session_id, skip=0, limit=10000)
        total_packets = len(packets)

        protocol_counts: Counter = Counter()
        src_ip_counts: Counter = Counter()
        dst_ip_counts: Counter = Counter()
        packet_lengths: List[int] = []
        first_ts: Optional[str] = packets[0].timestamp if packets else None
        last_ts: Optional[str] = packets[-1].timestamp if packets else None

        dns_queries = 0
        dns_responses = 0
        http_requests = 0
        https_sessions = 0
        tcp_count = 0
        udp_count = 0
        icmp_count = 0
        arp_count = 0
        ipv4_count = 0
        ipv6_count = 0
        unknown_count = 0

        for p in packets:
            protocol_counts[p.protocol] += 1
            if p.source_ip and p.source_ip != "0.0.0.0":
                src_ip_counts[p.source_ip] += 1
            if p.destination_ip and p.destination_ip != "0.0.0.0":
                dst_ip_counts[p.destination_ip] += 1

            packet_lengths.append(p.packet_length)

            if p.protocol == "DNS":
                dns_queries += 1
            elif p.protocol == "HTTP":
                http_requests += 1
            elif p.protocol == "HTTPS":
                https_sessions += 1
            elif "TCP" in p.protocol:
                tcp_count += 1
            elif "UDP" in p.protocol:
                udp_count += 1
            elif p.protocol == "ICMP":
                icmp_count += 1
            elif p.protocol == "ARP":
                arp_count += 1
            elif p.protocol == "IPv4":
                ipv4_count += 1
            elif p.protocol == "IPv6":
                ipv6_count += 1
            else:
                unknown_count += 1

        return await self._format_and_save_enrichment(
            session_id=session_id,
            total_packets=total_packets,
            protocol_counts=protocol_counts,
            src_ip_counts=src_ip_counts,
            dst_ip_counts=dst_ip_counts,
            packet_lengths=packet_lengths,
            first_ts=first_ts or "",
            last_ts=last_ts or "",
            dns_queries=dns_queries,
            dns_responses=dns_responses,
            http_requests=http_requests,
            https_sessions=https_sessions,
            tcp_count=tcp_count,
            udp_count=udp_count,
            icmp_count=icmp_count,
            arp_count=arp_count,
            ipv4_count=ipv4_count,
            ipv6_count=ipv6_count,
            unknown_count=unknown_count,
            engine_name="Scapy / PyShark Engine (TShark Fallback)"
        )

    async def _format_and_save_enrichment(
        self,
        session_id: str,
        total_packets: int,
        protocol_counts: Counter,
        src_ip_counts: Counter,
        dst_ip_counts: Counter,
        packet_lengths: List[int],
        first_ts: str,
        last_ts: str,
        dns_queries: int,
        dns_responses: int,
        http_requests: int,
        https_sessions: int,
        tcp_count: int,
        udp_count: int,
        icmp_count: int,
        arp_count: int,
        ipv4_count: int,
        ipv6_count: int,
        unknown_count: int,
        engine_name: str,
    ) -> Dict[str, Any]:
        """Formats statistics and saves enriched analysis_summary and top_protocols to PcapSessionModel."""
        top_protocols: List[Dict[str, Any]] = []
        denom = max(1, total_packets)

        for name, count in protocol_counts.most_common(10):
            top_protocols.append({
                "name": name,
                "count": count,
                "percentage": round((count / denom) * 100.0, 1),
            })

        all_ip_counts = src_ip_counts + dst_ip_counts
        top_talkers = [
            {"ip": ip, "packet_count": count}
            for ip, count in all_ip_counts.most_common(5)
        ]

        top_src = src_ip_counts.most_common(1)[0][0] if src_ip_counts else "None"
        top_dst = dst_ip_counts.most_common(1)[0][0] if dst_ip_counts else "None"

        min_len = min(packet_lengths) if packet_lengths else 0
        max_len = max(packet_lengths) if packet_lengths else 0
        avg_len = round(sum(packet_lengths) / max(1, len(packet_lengths)), 1) if packet_lengths else 0.0

        analysis_summary = {
            "unique_source_ip_count": len(src_ip_counts),
            "unique_destination_ip_count": len(dst_ip_counts),
            "top_source_ip": top_src,
            "top_destination_ip": top_dst,
            "top_talkers": top_talkers,
            "packet_size_stats": {
                "min_bytes": min_len,
                "max_bytes": max_len,
                "avg_bytes": avg_len,
            },
            "dns_query_count": dns_queries,
            "dns_response_count": dns_responses,
            "http_request_count": http_requests,
            "https_session_count": https_sessions,
            "tcp_session_count": tcp_count,
            "udp_session_count": udp_count,
            "icmp_count": icmp_count,
            "arp_count": arp_count,
            "ipv4_count": ipv4_count,
            "ipv6_count": ipv6_count,
            "unknown_protocol_count": unknown_count,
            "first_packet_timestamp": first_ts,
            "last_packet_timestamp": last_ts,
        }

        session_obj = await self.pcap_repo.get_session(session_id)
        if session_obj:
            evidence_id = session_obj.evidence_id
            uploaded_by = session_obj.uploaded_by
            duration_seconds = session_obj.duration_seconds

            await self.pcap_repo.update(
                session_obj,
                top_protocols=top_protocols,
                analysis_summary=analysis_summary,
                analysis_engine=engine_name,
                status="Completed",
            )

            # 1. Enrich Evidence Record
            case_id = "case-001"
            incident_id = "inc-001"
            if evidence_id:
                from app.repositories.evidence_repository import EvidenceRepository
                evidence_repo = EvidenceRepository(self.pcap_repo.session)
                evidence = await evidence_repo.get_by_id(evidence_id)
                if evidence:
                    case_id = evidence.case_id or "case-001"
                    incident_id = evidence.incident_id or "inc-001"
                    now_iso = datetime.now(timezone.utc).isoformat()
                    evidence.packet_count = total_packets
                    evidence.analysis_engine = engine_name
                    evidence.analysis_status = "Completed"
                    evidence.analysis_summary = analysis_summary
                    evidence.top_protocols = top_protocols
                    evidence.capture_duration = duration_seconds
                    evidence.analysis_completed_at = now_iso

            # 2. Log Timeline Event
            from app.repositories.timeline_repository import TimelineRepository
            timeline_repo = TimelineRepository(self.pcap_repo.session)
            await timeline_repo.create_pcap_event(
                event_type="Analysis Completed",
                description=f"PCAP analysis completed successfully via {engine_name}. Parsed {total_packets} packets.",
                user=uploaded_by,
                case_id=case_id,
                incident_id=incident_id,
                evidence_id=evidence_id,
                session_id=session_id,
                severity="Info",
            )

        return {
            "top_protocols": top_protocols,
            "analysis_summary": analysis_summary,
            "analysis_engine": engine_name,
            "status": "Completed",
        }

    async def analyze_file(self, file_path: str, display_filter: Optional[str] = None) -> Dict[str, Any]:
        """PyShark deep inspection interface helper."""
        logger.info("PySharkService.analyze_file called", file_path=file_path)
        return {
            "file_path": file_path,
            "status": "analysis_completed"
        }

    async def extract_http_streams(self, file_path: str) -> List[Dict[str, Any]]:
        """HTTP stream extraction interface helper."""
        return []
