from typing import Any, Dict, List
from app.core.logging import logger


class ScapyService:
    """Service interface placeholder for Scapy raw packet parsing and manipulation."""

    async def parse_pcap_summary(self, file_path: str) -> Dict[str, Any]:
        """Scapy fast summary interface placeholder."""
        logger.info("ScapyService.parse_pcap_summary called", file_path=file_path)
        return {
            "file_path": file_path,
            "total_bytes": 0,
            "packet_count": 0,
            "protocols": {},
            "status": "placeholder_ready"
        }

    async def extract_dns_queries(self, file_path: str) -> List[str]:
        """DNS query extraction interface placeholder."""
        return []
