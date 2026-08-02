import os
from typing import Dict, Any
from app.core.config import settings
from app.core.logging import logger


class StorageService:
    """Service for Evidence Storage management (Local upload directory & Supabase Storage)."""

    def __init__(self):
        os.makedirs(settings.UPLOAD_DIRECTORY, exist_ok=True)

    async def save_evidence_file(self, content: bytes, storage_path: str) -> Dict[str, Any]:
        """Saves file content to target storage location."""
        full_path = os.path.join(settings.UPLOAD_DIRECTORY, storage_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)

        with open(full_path, "wb") as f:
            f.write(content)

        logger.info("StorageService.save_evidence_file succeeded", storage_path=storage_path, bytes=len(content))

        return {
            "storage_path": storage_path,
            "full_path": full_path,
            "size_bytes": len(content),
            "url": f"/uploads/{storage_path}",
        }

    async def read_evidence_file(self, storage_path: str) -> bytes:
        """Reads file content from storage."""
        full_path = os.path.join(settings.UPLOAD_DIRECTORY, storage_path)
        if not os.path.exists(full_path):
            raise FileNotFoundError(f"Evidence file not found at '{storage_path}'")

        with open(full_path, "rb") as f:
            return f.read()

    async def delete_evidence_file(self, storage_path: str) -> bool:
        """Deletes file from storage."""
        full_path = os.path.join(settings.UPLOAD_DIRECTORY, storage_path)
        if os.path.exists(full_path):
            os.remove(full_path)
            return True
        return False
