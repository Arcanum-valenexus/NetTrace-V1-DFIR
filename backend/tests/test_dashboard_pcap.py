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
async def test_dashboard_pcap_metrics_aggregation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await get_authenticated_headers(client)

        # 1. Upload PCAP to generate real DB metrics
        pcap_bytes = generate_sample_pcap_bytes()
        files = {"file": ("dashboard_test.pcap", pcap_bytes, "application/vnd.tcpdump.pcap")}
        data = {"caseId": "case-dash-001", "incidentId": "inc-dash-001"}

        res_upload = await client.post("/api/v1/pcap/analyze", files=files, data=data, headers=headers)
        assert res_upload.status_code == 201

        # 2. Query Dashboard Overview Metrics
        res_overview = await client.get("/api/v1/dashboard/metrics", headers=headers)
        assert res_overview.status_code == 200
        overview_data = res_overview.json()["data"]
        assert "pcapMetrics" in overview_data
        pcap_metrics = overview_data["pcapMetrics"]
        assert pcap_metrics["totalPcapSessions"] >= 1
        assert pcap_metrics["totalPackets"] >= 2
        assert pcap_metrics["completedAnalyses"] >= 1

        # 3. Query Dedicated PCAP Stats Endpoint
        res_pcap_stats = await client.get("/api/v1/dashboard/pcap-stats", headers=headers)
        assert res_pcap_stats.status_code == 200
        stats = res_pcap_stats.json()["data"]
        assert stats["totalPcapSessions"] >= 1
        assert stats["totalPackets"] >= 2
        assert isinstance(stats["topProtocols"], list)
        assert len(stats["topProtocols"]) > 0
        assert isinstance(stats["topSourceIps"], list)
        assert len(stats["topSourceIps"]) > 0
