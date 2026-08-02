import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_incidents_crud_operations():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create incident
        payload = {
            "title": "LockBit 3.0 Test Incident",
            "severity": "Critical",
            "category": "Ransomware",
            "assignedAnalyst": "Alex Mercer",
            "summary": "Automated test telemetry creation."
        }
        res_create = await client.post("/api/v1/incidents", json=payload)
        assert res_create.status_code == 201
        inc_data = res_create.json()["data"]
        assert inc_data["title"] == payload["title"]
        inc_id = inc_data["id"]

        # List incidents
        res_list = await client.get("/api/v1/incidents")
        assert res_list.status_code == 200
        assert len(res_list.json()["data"]) >= 1

        # Get incident details
        res_get = await client.get(f"/api/v1/incidents/{inc_id}")
        assert res_get.status_code == 200
        assert res_get.json()["data"]["id"] == inc_id
