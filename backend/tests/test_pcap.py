import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from tests.conftest import get_authenticated_headers


@pytest.mark.asyncio
async def test_pcap_upload_session_creation_and_listing():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await get_authenticated_headers(client)

        # 1. Test uploading valid .pcap file
        pcap_content = b"\xd4\xc3\xb2\xa1\x02\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xff\x00\x00\x01\x00\x00\x00"
        files = {"file": ("capture.pcap", pcap_content, "application/vnd.tcpdump.pcap")}
        data = {"caseId": "case-001", "incidentId": "inc-001"}

        res_upload = await client.post("/api/v1/pcap/analyze", files=files, data=data, headers=headers)
        assert res_upload.status_code == 201
        res_json = res_upload.json()
        assert res_json["success"] is True

        upload_data = res_json["data"]
        session_id = upload_data["sessionId"]
        assert upload_data["filename"] == "capture.pcap"
        assert upload_data["status"] in ["Completed", "Uploaded"]
        assert upload_data["evidenceId"] is not None

        # 2. Get session details by ID
        res_session = await client.get(f"/api/v1/pcap/sessions/{session_id}", headers=headers)
        assert res_session.status_code == 200
        session_info = res_session.json()["data"]
        assert session_info["id"] == session_id
        assert session_info["filename"] == "capture.pcap"
        assert session_info["evidenceId"] == upload_data["evidenceId"]

        # 3. List sessions
        res_list = await client.get("/api/v1/pcap/sessions", headers=headers)
        assert res_list.status_code == 200
        sessions_list = res_list.json()["data"]
        assert any(s["id"] == session_id for s in sessions_list)

        # 4. List packets for session (expected empty list in Milestone 1)
        res_packets = await client.get(f"/api/v1/pcap/sessions/{session_id}/packets", headers=headers)
        assert res_packets.status_code == 200
        packets_data = res_packets.json()["data"]
        assert packets_data["sessionId"] == session_id
        assert packets_data["totalPackets"] == 0
        assert packets_data["packets"] == []


@pytest.mark.asyncio
async def test_pcap_upload_invalid_extension():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await get_authenticated_headers(client)

        files = {"file": ("malicious.exe", b"MZ......", "application/x-msdownload")}
        data = {"caseId": "case-001", "incidentId": "inc-001"}

        res_upload = await client.post("/api/v1/pcap/analyze", files=files, data=data, headers=headers)
        assert res_upload.status_code == 400
        assert "Only .pcap and .pcapng files are permitted" in res_upload.json()["detail"]


@pytest.mark.asyncio
async def test_pcap_session_not_found():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await get_authenticated_headers(client)

        res_get = await client.get("/api/v1/pcap/sessions/non-existent-id", headers=headers)
        assert res_get.status_code == 404
