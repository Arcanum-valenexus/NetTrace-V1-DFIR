import hashlib
from typing import Dict


class HashService:
    """Service providing cryptographic evidence hashing (SHA256, MD5, SHA1)."""

    @staticmethod
    def compute_hashes_from_bytes(content: bytes) -> Dict[str, str]:
        """Calculates SHA256, MD5, and SHA1 hashes from raw file content."""
        sha256_hash = hashlib.sha256(content).hexdigest()
        md5_hash = hashlib.md5(content).hexdigest()
        sha1_hash = hashlib.sha1(content).hexdigest()

        return {
            "sha256": sha256_hash,
            "md5": md5_hash,
            "sha1": sha1_hash,
        }

    @staticmethod
    def verify_integrity(content: bytes, expected_sha256: str) -> bool:
        """Verifies evidence hash integrity."""
        calculated = hashlib.sha256(content).hexdigest()
        return calculated.lower() == expected_sha256.lower()
