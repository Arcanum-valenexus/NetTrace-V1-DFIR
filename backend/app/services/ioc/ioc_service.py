import re
from typing import Dict, List
from app.core.logging import logger


class IOCService:
    """Service interface placeholder for IOC extraction, STIX conversion, and scoring."""

    async def extract_iocs_from_text(self, raw_text: str) -> Dict[str, List[str]]:
        """Regex/Parser IOC extraction interface placeholder."""
        logger.info("IOCService.extract_iocs_from_text called", text_length=len(raw_text))
        
        ip_pattern = r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
        sha256_pattern = r'\b[a-fA-F0-9]{64}\b'
        
        ips = list(set(re.findall(ip_pattern, raw_text)))
        hashes = list(set(re.findall(sha256_pattern, raw_text)))
        
        return {
            "ips": ips,
            "hashes": hashes,
            "domains": [],
            "urls": [],
        }
