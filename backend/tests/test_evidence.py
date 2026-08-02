import pytest
from httpx import AsyncClient, ASGITransport
from io import BytesIO
from app.main import app


@pytest.mark.asyncio
async def test_evidence_upload_and_hashing():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        files = {"file": ("test_capture.pcap", BytesIO(b"DUMMY_PCAP_STREAM_CONTENT_12345"), "application/vnd.tcpdump.pcap")}
        data = {"category": "PCAP Trace", "caseId": "CASE-2026-001", "incidentId": "inc-1"}

        res = await client.post("/api/v1/evidence/upload", files=files, data=data)
        assert res.status_code == 201
        ev_data = res.json()["data"]
        assert ev_data["name"] == "test_capture.pcap"
        assert len(ev_data["hashSha256"]) == 64
        assert len(ev_data["hashMd5"]) == 32
