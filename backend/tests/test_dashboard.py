import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_dashboard_metrics():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/dashboard/metrics")
        assert res.status_code == 200
        data = res.json()["data"]
        assert "activeIncidents" in data
        assert "criticalAlerts" in data
        assert "threatLevel" in data
