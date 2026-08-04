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
async def test_timeline_events_for_pcap_analysis():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await get_authenticated_headers(client)

        # 1. Create Incident
        inc_payload = {
            "title": "Timeline PCAP Ingestion",
            "severity": "Medium",
            "category": "Network Anomaly",
            "assignedAnalyst": "DFIR Investigator",
            "summary": "Ingesting network trace for timeline audit logging.",
        }
        res_inc = await client.post("/api/v1/incidents", json=inc_payload, headers=headers)
        assert res_inc.status_code == 201
        incident_id = res_inc.json()["data"]["id"]

        # 2. Upload PCAP to trigger timeline events
        pcap_bytes = generate_sample_pcap_bytes()
        files = {"file": ("timeline_trace.pcap", pcap_bytes, "application/vnd.tcpdump.pcap")}
        data = {"caseId": "case-time-001", "incidentId": incident_id}

        res_upload = await client.post("/api/v1/pcap/analyze", files=files, data=data, headers=headers)
        assert res_upload.status_code == 201

        # 3. Query Incident Details to check Timeline events
        res_details = await client.get(f"/api/v1/incidents/{incident_id}", headers=headers)
        assert res_details.status_code == 200
        incident_data = res_details.json()["data"]
        timeline_events = incident_data["timeline"]

        assert isinstance(timeline_events, list)
        assert len(timeline_events) >= 3

        event_types = [e["eventType"] for e in timeline_events]
        assert "PCAP Uploaded" in event_types
        assert "Analysis Started" in event_types
        assert "Analysis Completed" in event_types
