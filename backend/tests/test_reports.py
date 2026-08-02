import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_reports_generation_and_revision():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create an incident first
        inc_res = await client.post("/api/v1/incidents", json={
            "title": "Report Generation Test Incident",
            "severity": "High",
            "category": "Malware",
            "assignedAnalyst": "Alex Mercer",
            "summary": "Report test summary."
        })
        inc_id = inc_res.json()["data"]["id"]

        # Generate report
        gen_res = await client.post("/api/v1/reports/generate", json={
            "incident_id": inc_id,
            "case_id": "CASE-2026-001"
        })
        assert gen_res.status_code == 201
        rep_data = gen_res.json()["data"]
        assert rep_data["version"] == 1
        rep_id = rep_data["id"]

        # Get report details
        get_res = await client.get(f"/api/v1/reports/{rep_id}")
        assert get_res.status_code == 200
        assert get_res.json()["data"]["id"] == rep_id

        # Create revision
        rev_res = await client.post(f"/api/v1/reports/{rep_id}/revision", json={
            "revisionReason": "Included new C2 findings"
        })
        assert rev_res.status_code == 200
        assert rev_res.json()["data"]["version"] == 2
