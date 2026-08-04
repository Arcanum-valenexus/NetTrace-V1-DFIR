import os
import tempfile
from unittest.mock import patch
import pytest
from httpx import AsyncClient, ASGITransport
import scapy.all as scapy

from app.main import app
from app.services.pcap.pyshark_service import PySharkService
from tests.conftest import get_authenticated_headers


def generate_sample_pcap_bytes() -> bytes:
    """Generates valid PCAP binary bytes containing Ethernet, IP, TCP, UDP, and DNS packets."""
    pkts = [
        scapy.Ether()/scapy.IP(src="192.168.1.100", dst="10.0.0.5")/scapy.TCP(sport=54321, dport=80, flags="S"),
        scapy.Ether()/scapy.IP(src="10.0.0.5", dst="192.168.1.100")/scapy.TCP(sport=80, dport=54321, flags="SA"),
        scapy.Ether()/scapy.IP(src="192.168.1.100", dst="8.8.8.8")/scapy.UDP(sport=5353, dport=53)/scapy.DNS(rd=1, qd=scapy.DNSQR(qname="c2-server.malicious.net")),
        scapy.Ether()/scapy.IP(src="192.168.1.105", dst="1.1.1.1")/scapy.ICMP(),
    ]
    with tempfile.NamedTemporaryFile(suffix=".pcap", delete=False) as tmp:
        tmp_path = tmp.name
    try:
        scapy.wrpcap(tmp_path, pkts)
        with open(tmp_path, "rb") as f:
            return f.read()
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@pytest.mark.asyncio
async def test_pyshark_tshark_detection_and_fallback():
    assert isinstance(PySharkService.is_tshark_available(), bool)


@pytest.mark.asyncio
async def test_pyshark_deep_analysis_and_session_enrichment():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await get_authenticated_headers(client)

        pcap_bytes = generate_sample_pcap_bytes()
        files = {"file": ("deep_analysis.pcap", pcap_bytes, "application/vnd.tcpdump.pcap")}
        data = {"caseId": "case-pyshark-001", "incidentId": "inc-pyshark-001"}

        # 1. Upload & Enrich
        res_upload = await client.post("/api/v1/pcap/analyze", files=files, data=data, headers=headers)
        assert res_upload.status_code == 201
        upload_resp = res_upload.json()["data"]
        session_id = upload_resp["sessionId"]
        assert upload_resp["status"] == "Completed"

        # 2. Get Enriched Session Details
        res_session = await client.get(f"/api/v1/pcap/sessions/{session_id}", headers=headers)
        assert res_session.status_code == 200
        session_info = res_session.json()["data"]
        assert session_info["status"] == "Completed"
        assert session_info["packetCount"] == 4

        # Verify topProtocols
        top_protocols = session_info["topProtocols"]
        assert isinstance(top_protocols, list)
        assert len(top_protocols) > 0
        proto_names = [p["name"] for p in top_protocols]
        assert "DNS" in proto_names or "HTTP" in proto_names or "TCP" in proto_names or "ICMP" in proto_names

        # Verify analysisSummary
        summary = session_info["analysisSummary"]
        assert isinstance(summary, dict)
        assert summary["unique_source_ip_count"] >= 2
        assert summary["unique_destination_ip_count"] >= 2
        assert summary["top_source_ip"] == "192.168.1.100"
        assert "top_talkers" in summary
        assert len(summary["top_talkers"]) > 0
        assert summary["dns_query_count"] >= 1
        assert summary["icmp_count"] >= 1


@pytest.mark.asyncio
async def test_pyshark_explicit_tshark_unavailable_fallback():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await get_authenticated_headers(client)

        pcap_bytes = generate_sample_pcap_bytes()
        files = {"file": ("fallback_test.pcap", pcap_bytes, "application/vnd.tcpdump.pcap")}
        data = {"caseId": "case-pyshark-fallback", "incidentId": "inc-pyshark-fallback"}

        with patch("app.services.pcap.pyshark_service.PySharkService.is_tshark_available", return_value=False):
            res_upload = await client.post("/api/v1/pcap/analyze", files=files, data=data, headers=headers)
            assert res_upload.status_code == 201
            session_id = res_upload.json()["data"]["sessionId"]

            res_session = await client.get(f"/api/v1/pcap/sessions/{session_id}", headers=headers)
            assert res_session.status_code == 200
            session_info = res_session.json()["data"]
            assert session_info["status"] == "Completed"
            assert "Fallback" in session_info["analysisEngine"]
            assert len(session_info["topProtocols"]) > 0
