import os
import tempfile
import pytest
from httpx import AsyncClient, ASGITransport
import scapy.all as scapy

from app.main import app
from tests.conftest import get_authenticated_headers


def generate_sample_pcap_bytes() -> bytes:
    """Generates valid PCAP binary bytes containing Ethernet, IP, TCP, and UDP packets."""
    pkts = [
        scapy.Ether()/scapy.IP(src="192.168.1.10", dst="10.0.0.1")/scapy.TCP(sport=12345, dport=80, flags="S"),
        scapy.Ether()/scapy.IP(src="192.168.1.10", dst="8.8.8.8")/scapy.UDP(sport=5353, dport=53)/scapy.DNS(rd=1, qd=scapy.DNSQR(qname="test.domain.com")),
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
async def test_pcap_forensic_report_generation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await get_authenticated_headers(client)

        # 1. Create Incident
        inc_payload = {
            "title": "Suspicious PCAP Exfiltration",
            "severity": "High",
            "category": "Data Exfiltration",
            "assignedAnalyst": "Lead DFIR Analyst",
            "summary": "Investigating high-volume outbound network capture trace.",
        }
        res_inc = await client.post("/api/v1/incidents", json=inc_payload, headers=headers)
        assert res_inc.status_code == 201
        incident_id = res_inc.json()["data"]["id"]

        # 2. Upload & Dissect PCAP
        pcap_bytes = generate_sample_pcap_bytes()
        files = {"file": ("report_trace.pcap", pcap_bytes, "application/vnd.tcpdump.pcap")}
        data = {"caseId": "case-rep-001", "incidentId": incident_id}

        res_upload = await client.post("/api/v1/pcap/analyze", files=files, data=data, headers=headers)
        assert res_upload.status_code == 201

        # 3. Generate DFIR Forensics Report
        rep_payload = {"incident_id": incident_id, "case_id": "case-rep-001"}
        res_report = await client.post("/api/v1/reports/generate", json=rep_payload, headers=headers)
        assert res_report.status_code == 201
        report_data = res_report.json()["data"]

        # 4. Verify packetAnalysis section in generated report
        pkt_analysis = report_data["packetAnalysis"]
        assert pkt_analysis is not None
        assert "pcapFilename" in pkt_analysis
        assert pkt_analysis["pcapFilename"] == "report_trace.pcap"
        assert pkt_analysis["totalPacketsParsed"] >= 2
        assert "topProtocols" in pkt_analysis
        assert "topTalkers" in pkt_analysis
        assert "evidenceReference" in pkt_analysis
