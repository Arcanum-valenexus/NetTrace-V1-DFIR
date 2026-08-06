import os
import tempfile
import pytest
from httpx import AsyncClient, ASGITransport
import scapy.all as scapy

from app.main import app
from tests.conftest import get_authenticated_headers


def generate_pcap_with_iocs() -> bytes:
    """Generates a PCAP file containing explicit IOC payload triggers (Domains, IPs, URLs, Hashes)."""
    pkts = [
        scapy.Ether()/scapy.IP(src="192.168.1.100", dst="185.220.101.5")/scapy.TCP(sport=54321, dport=80, flags="S"),
        scapy.Ether()/scapy.IP(src="192.168.1.100", dst="8.8.8.8")/scapy.UDP(sport=5353, dport=53)/scapy.DNS(rd=1, qd=scapy.DNSQR(qname="malicious-c2-server.com")),
        scapy.Ether()/scapy.IP(src="192.168.1.100", dst="10.0.0.1")/scapy.TCP(sport=12345, dport=80)/scapy.Raw(load=b"GET http://malware-download.xyz/payload.exe HTTP/1.1\r\nHash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\r\n\r\n"),
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
async def test_ioc_extraction_crud_and_status_transitions():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await get_authenticated_headers(client)

        # 1. Upload PCAP to trigger automatic IOC extraction
        pcap_bytes = generate_pcap_with_iocs()
        files = {"file": ("ioc_test_trace.pcap", pcap_bytes, "application/vnd.tcpdump.pcap")}
        data = {"caseId": "case-ioc-001", "incidentId": "inc-ioc-001"}

        res_upload = await client.post("/api/v1/pcap/analyze", files=files, data=data, headers=headers)
        assert res_upload.status_code == 201
        session_id = res_upload.json()["data"]["sessionId"]

        # 2. List Extracted IOCs
        res_list = await client.get("/api/v1/ioc", headers=headers)
        assert res_list.status_code == 200
        list_data = res_list.json()["data"]
        assert list_data["totalCount"] >= 1
        iocs = list_data["iocs"]
        assert len(iocs) >= 1

        target_ioc = iocs[0]
        ioc_id = target_ioc["id"]
        assert target_ioc["status"] == "Active"

        # 3. Get Single IOC Details
        res_get = await client.get(f"/api/v1/ioc/{ioc_id}", headers=headers)
        assert res_get.status_code == 200
        assert res_get.json()["data"]["id"] == ioc_id

        # 4. Update Status to Whitelisted
        res_status_white = await client.put(f"/api/v1/ioc/{ioc_id}/status", json={"status": "Whitelisted"}, headers=headers)
        assert res_status_white.status_code == 200
        assert res_status_white.json()["data"]["status"] == "Whitelisted"

        # 5. Update Status to Blocked
        res_status_block = await client.put(f"/api/v1/ioc/{ioc_id}/status", json={"status": "Blocked"}, headers=headers)
        assert res_status_block.status_code == 200
        assert res_status_block.json()["data"]["status"] == "Blocked"

        # 6. Manual Extract Trigger Endpoint
        res_extract = await client.post("/api/v1/ioc/extract", json={"sessionId": session_id, "caseId": "case-ioc-001"}, headers=headers)
        assert res_extract.status_code == 201
        assert isinstance(res_extract.json()["data"], list)

        # 7. Delete IOC
        res_delete = await client.delete(f"/api/v1/ioc/{ioc_id}", headers=headers)
        assert res_delete.status_code == 200
        assert res_delete.json()["success"] is True


@pytest.mark.asyncio
async def test_ioc_dashboard_and_report_integration():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await get_authenticated_headers(client)

        # 1. Create Incident
        inc_res = await client.post("/api/v1/incidents", json={
            "title": "IOC Report Case",
            "severity": "High",
            "category": "Malware Outbreak",
            "assignedAnalyst": "DFIR Team Lead",
            "summary": "Testing IOC integration into reports.",
        }, headers=headers)
        incident_id = inc_res.json()["data"]["id"]

        # 2. Upload PCAP with IOCs
        pcap_bytes = generate_pcap_with_iocs()
        files = {"file": ("ioc_report_trace.pcap", pcap_bytes, "application/vnd.tcpdump.pcap")}
        data = {"caseId": "case-ioc-rep", "incidentId": incident_id}

        res_upload = await client.post("/api/v1/pcap/analyze", files=files, data=data, headers=headers)
        assert res_upload.status_code == 201

        # 3. Query Dashboard Metrics
        res_dash = await client.get("/api/v1/dashboard/metrics", headers=headers)
        assert res_dash.status_code == 200
        dash_data = res_dash.json()["data"]
        assert "iocMetrics" in dash_data
        ioc_metrics = dash_data["iocMetrics"]
        assert ioc_metrics["totalIocs"] >= 1
        assert "iocTypes" in ioc_metrics

        # 4. Generate DFIR Report and check Section 7 (iocs)
        rep_res = await client.post("/api/v1/reports/generate", json={"incident_id": incident_id, "case_id": "case-ioc-rep"}, headers=headers)
        assert rep_res.status_code == 201
        report = rep_res.json()["data"]
        assert "iocs" in report
        ioc_section = report["iocs"]
        if isinstance(ioc_section, list):
            assert len(ioc_section) >= 1
        else:
            assert ioc_section["iocCount"] >= 1
            assert "suspiciousIps" in ioc_section or "suspiciousDomains" in ioc_section
