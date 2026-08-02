import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_auth_registration_and_login():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register new analyst
        reg_payload = {
            "fullName": "Test Analyst",
            "email": "test.analyst@nettrace.security",
            "password": "Password123!",
            "role": "Lead DFIR Investigator"
        }
        res_reg = await client.post("/api/v1/auth/register", json=reg_payload)
        assert res_reg.status_code in [201, 400]  # 201 Created or 400 if already exists

        # Login analyst
        login_payload = {
            "email": "test.analyst@nettrace.security",
            "password": "Password123!"
        }
        res_login = await client.post("/api/v1/auth/login", json=login_payload)
        assert res_login.status_code == 200
        data = res_login.json()["data"]
        assert "access_token" in data
        assert data["token_type"] == "Bearer"
