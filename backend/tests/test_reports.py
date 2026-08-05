import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from tests.conftest import get_authenticated_headers


@pytest.mark.asyncio
async def test_reports_generation_and_revision():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await get_authenticated_headers(client)

        # Create an incident first
        inc_res = await client.post("/api/v1/incidents", json={
            "title": "Report Generation Test Incident",
            "severity": "High",
            "category": "Malware",
            "assignedAnalyst": "Alex Mercer",
            "summary": "Report test summary."
        }, headers=headers)
        inc_id = inc_res.json()["data"]["id"]

        # Generate report
        gen_res = await client.post("/api/v1/reports/generate", json={
            "incident_id": inc_id,
            "case_id": "CASE-2026-001"
        }, headers=headers)
        assert gen_res.status_code == 201
        rep_data = gen_res.json()["data"]
        assert rep_data["version"] == 1
        rep_id = rep_data["id"]

        # Get report details
        get_res = await client.get(f"/api/v1/reports/{rep_id}", headers=headers)
        assert get_res.status_code == 200
        assert get_res.json()["data"]["id"] == rep_id

        # Download PDF report
        pdf_res = await client.get(f"/api/v1/reports/{rep_id}/pdf", headers=headers)
        assert pdf_res.status_code == 200
        assert pdf_res.headers["content-type"] == "application/pdf"
        assert b"%PDF-1.4" in pdf_res.content

        # Create revision
        rev_res = await client.post(f"/api/v1/reports/{rep_id}/revision", json={
            "revisionReason": "Included new C2 findings"
        }, headers=headers)
        assert rev_res.status_code == 200
        assert rev_res.json()["data"]["version"] == 2

