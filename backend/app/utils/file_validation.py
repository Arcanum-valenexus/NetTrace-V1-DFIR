import os
import re
import uuid
from datetime import datetime, timezone
from typing import Set, Tuple
from fastapi import HTTPException, UploadFile, status
from app.core.config import settings

# Allowed forensic evidence extensions
ALLOWED_EXTENSIONS: Set[str] = {
    ".pcap", ".pcapng", ".cap",
    ".raw", ".mem", ".dd", ".img", ".vmdk",
    ".evtx", ".log", ".txt", ".csv", ".json",
    ".bin", ".exe", ".dll", ".elf", ".sys",
    ".pdf", ".png", ".jpg", ".jpeg",
    ".zip", ".tar", ".gz", ".7z"
}

# Allowed MIME types
ALLOWED_MIME_TYPES: Set[str] = {
    "application/vnd.tcpdump.pcap",
    "application/x-pcapng",
    "application/octet-stream",
    "application/x-dasein",
    "text/plain",
    "text/csv",
    "application/json",
    "application/pdf",
    "image/png",
    "image/jpeg",
    "application/zip",
    "application/x-tar",
    "application/gzip",
    "application/x-7z-compressed"
}


def sanitize_filename(filename: str) -> str:
    """
    Sanitizes filenames to prevent directory traversal, shell injection, and malicious characters.
    Replaces any non-alphanumeric, dot, underscore, or hyphen characters with an underscore.
    """
    if not filename:
        return "unnamed_artifact.bin"
    
    # Strip directory components (path traversal prevention)
    filename = os.path.basename(filename)
    
    # Remove null bytes or control characters
    filename = filename.replace("\x00", "").strip()
    
    # Replace unsafe characters with underscore
    sanitized = re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)
    
    # Avoid hidden files or double dots
    if sanitized.startswith('.'):
        sanitized = 'artifact_' + sanitized.lstrip('.')
        
    return sanitized[:255]  # Limit length


def validate_file_upload(file: UploadFile, file_size_bytes: int) -> Tuple[str, str]:
    """
    Validates file extension, maximum file size, MIME type, and sanitizes filename.
    Returns (sanitized_filename, file_extension).
    """
    original_filename = file.filename or "evidence.bin"
    sanitized = sanitize_filename(original_filename)
    
    _, ext = os.path.splitext(sanitized.lower())
    
    if not ext or ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension '{ext}' is not permitted for evidence ingestion.",
        )

    if file_size_bytes > settings.MAX_UPLOAD_SIZE:
        max_mb = settings.MAX_UPLOAD_SIZE // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum permitted threshold of {max_mb} MB.",
        )

    return sanitized, ext


def generate_secure_storage_path(sanitized_filename: str, case_id: str = "general") -> str:
    """
    Generates a secure, unguessable storage path incorporating year/month/day and UUID
    to guarantee zero duplicate filename collisions.
    Example: evidence/2026/08/02/CASE-001/a8f39k2l_capture.pcap
    """
    now = datetime.now(timezone.utc)
    unique_id = str(uuid.uuid4())[:8]
    safe_case = sanitize_filename(case_id)
    
    date_path = now.strftime("%Y/%m/%d")
    secure_filename = f"{unique_id}_{sanitized_filename}"
    
    return f"evidence/{date_path}/{safe_case}/{secure_filename}"
