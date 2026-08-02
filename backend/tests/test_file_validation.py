import pytest
from fastapi import HTTPException, UploadFile
from io import BytesIO

from app.utils.file_validation import (
    sanitize_filename,
    validate_file_upload,
    generate_secure_storage_path,
)


def test_sanitize_filename_malicious_paths():
    assert sanitize_filename("../../etc/passwd") == "passwd"
    assert sanitize_filename("..\\..\\windows\\system32.exe") == "system32.exe"
    assert sanitize_filename("test\x00file.pcap") == "testfile.pcap"
    assert sanitize_filename(".hidden_file.dd") == "artifact_hidden_file.dd"


def test_generate_secure_storage_path():
    path = generate_secure_storage_path("capture.pcap", case_id="CASE-2026-001")
    assert path.startswith("evidence/")
    assert "CASE-2026-001" in path
    assert "capture.pcap" in path


def test_validate_file_upload_disallowed_extension():
    fake_file = UploadFile(filename="script.sh", file=BytesIO(b"echo 123"))
    with pytest.raises(HTTPException) as exc_info:
        validate_file_upload(fake_file, file_size_bytes=100)
    assert exc_info.value.status_code == 400
    assert "is not permitted" in exc_info.value.detail
