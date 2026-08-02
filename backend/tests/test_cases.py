import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_cases_crud_operations():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create case
        payload = {
            "title": "Operation Nightfall Investigation",
            "description": "APT29 spearphishing campaign analysis",
            "priority": "High"
        }
        res_create = await client.post("/api/v1/cases", json=payload)
        assert res_create.status_code == 201
        case_data = res_create.json()["data"]
        assert case_data["title"] == payload["title"]
        case_id = case_data["id"]

        # List cases
        res_list = await client.get("/api/v1/cases")
        assert res_list.status_code == 200
        assert len(res_list.json()["data"]) >= 1

        # Get case
        res_get = await client.get(f"/api/v1/cases/{case_id}")
        assert res_get.status_code == 200
        assert res_get.json()["data"]["id"] == case_id

        # Update case
        res_update = await client.put(f"/api/v1/cases/{case_id}", json={"status": "Closed"})
        assert res_update.status_code == 200
        assert res_update.json()["data"]["status"] == "Closed"

        # Soft delete case
        res_delete = await client.delete(f"/api/v1/cases/{case_id}")
        assert res_delete.status_code == 200
        assert res_delete.json()["success"] is True
