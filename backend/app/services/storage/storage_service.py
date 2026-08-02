from typing import Any, Dict
from app.core.logging import logger


class StorageService:
    """Service interface placeholder for Supabase Storage and file operations."""

    async def upload_evidence_file(self, file_content: bytes, destination_path: str) -> Dict[str, Any]:
        """Storage upload interface placeholder."""
        logger.info("StorageService.upload_evidence_file called", destination_path=destination_path, size=len(file_content))
        return {
            "path": destination_path,
            "size_bytes": len(file_content),
            "status": "uploaded",
            "url": f"https://supabase.co/storage/v1/object/public/nettrace-evidence/{destination_path}"
        }

    async def delete_file(self, path: str) -> bool:
        """Storage deletion placeholder."""
        return True
