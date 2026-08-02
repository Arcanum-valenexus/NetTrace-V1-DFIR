import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_platform_settings():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Get settings
        res_get = await client.get("/api/v1/settings")
        assert res_get.status_code == 200
        data = res_get.json()["data"]
        assert "theme" in data
        assert "language" in data

        # Update settings
        res_put = await client.put("/api/v1/settings", json={"theme": "dark-matrix", "timeFormat": "12 Hour"})
        assert res_put.status_code == 200
        assert res_put.json()["data"]["theme"] == "dark-matrix"
