import os
import tempfile
import pytest
from httpx import AsyncClient, ASGITransport
import scapy.all as scapy

from app.main import app
from tests.conftest import get_authenticated_headers


def generate_sample_pcap_bytes() -> bytes:
    """Generates valid PCAP binary bytes containing Ethernet, IP, TCP, UDP, and DNS packets."""
    pkts = [
        scapy.Ether()/scapy.IP(src="192.168.1.50", dst="10.0.0.1")/scapy.TCP(sport=12345, dport=80, flags="S"),
        scapy.Ether()/scapy.IP(src="10.0.0.1", dst="192.168.1.50")/scapy.TCP(sport=80, dport=12345, flags="SA"),
        scapy.Ether()/scapy.IP(src="192.168.1.50", dst="8.8.8.8")/scapy.UDP(sport=5353, dport=53)/scapy.DNS(rd=1, qd=scapy.DNSQR(qname="malicious-domain.com")),
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
async def test_scapy_pcap_dissection_persistence_and_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await get_authenticated_headers(client)

        pcap_bytes = generate_sample_pcap_bytes()
        files = {"file": ("network_trace.pcap", pcap_bytes, "application/vnd.tcpdump.pcap")}
        data = {"caseId": "case-scapy-001", "incidentId": "inc-scapy-001"}

        # 1. Upload & Dissect
        res_upload = await client.post("/api/v1/pcap/analyze", files=files, data=data, headers=headers)
        assert res_upload.status_code == 201
        upload_resp = res_upload.json()["data"]
        session_id = upload_resp["sessionId"]
        assert upload_resp["status"] == "Completed"

        # 2. Verify Session Details
        res_session = await client.get(f"/api/v1/pcap/sessions/{session_id}", headers=headers)
        assert res_session.status_code == 200
        session_info = res_session.json()["data"]
        assert session_info["status"] == "Completed"
        assert session_info["packetCount"] == 3
        assert "Scapy" in session_info["analysisEngine"] or "PyShark" in session_info["analysisEngine"]

        # 3. Verify Packet List Endpoint Returns Real Data
        res_packets = await client.get(f"/api/v1/pcap/sessions/{session_id}/packets", headers=headers)
        assert res_packets.status_code == 200
        packets_data = res_packets.json()["data"]
        assert packets_data["totalPackets"] == 3
        packets = packets_data["packets"]
        assert len(packets) == 3

        # Check TCP packet details
        tcp_pkt = packets[0]
        assert tcp_pkt["packetNumber"] == 1
        assert tcp_pkt["sourceIp"] == "192.168.1.50"
        assert tcp_pkt["destinationIp"] == "10.0.0.1"
        assert tcp_pkt["sourcePort"] == 12345
        assert tcp_pkt["destinationPort"] == 80
        assert "HTTP" in tcp_pkt["protocol"] or "TCP" in tcp_pkt["protocol"]

        # Check DNS packet details
        dns_pkt = packets[2]
        assert dns_pkt["protocol"] == "DNS"
        assert dns_pkt["destinationPort"] == 53
        assert "malicious-domain.com" in dns_pkt["info"]

        # 4. Verify Packet Detail Endpoint with Hex & ASCII Streams
        res_detail = await client.get(f"/api/v1/pcap/sessions/{session_id}/packets/1", headers=headers)
        assert res_detail.status_code == 200
        detail_data = res_detail.json()["data"]
        assert detail_data["packetNumber"] == 1
        assert detail_data["payloadHex"] is not None
        assert len(detail_data["payloadHex"]) > 0
        assert detail_data["payloadAscii"] is not None


@pytest.mark.asyncio
async def test_scapy_packet_detail_not_found():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await get_authenticated_headers(client)

        pcap_bytes = generate_sample_pcap_bytes()
        files = {"file": ("test_not_found.pcap", pcap_bytes, "application/vnd.tcpdump.pcap")}
        data = {"caseId": "case-scapy-002", "incidentId": "inc-scapy-002"}

        res_upload = await client.post("/api/v1/pcap/analyze", files=files, data=data, headers=headers)
        session_id = res_upload.json()["data"]["sessionId"]

        res_detail = await client.get(f"/api/v1/pcap/sessions/{session_id}/packets/9999", headers=headers)
        assert res_detail.status_code == 404
        assert "Packet #9999 was not found" in res_detail.json()["detail"]
