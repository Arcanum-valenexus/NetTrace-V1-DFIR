import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_auth_registration_login_refresh_and_logout():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register new analyst
        reg_payload = {
            "fullName": "Test Analyst Auth",
            "email": "test.auth.flow@nettrace.security",
            "password": "Password123!",
            "role": "Lead DFIR Investigator"
        }
        res_reg = await client.post("/api/v1/auth/register", json=reg_payload)
        assert res_reg.status_code in [201, 400]

        # Login analyst
        login_payload = {
            "email": "test.auth.flow@nettrace.security",
            "password": "Password123!"
        }
        res_login = await client.post("/api/v1/auth/login", json=login_payload)
        assert res_login.status_code == 200
        data = res_login.json()["data"]
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "Bearer"

        refresh_token = data["refresh_token"]

        # Test refresh token
        res_refresh = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
        assert res_refresh.status_code == 200
        refresh_data = res_refresh.json()["data"]
        assert "access_token" in refresh_data
        assert "refresh_token" in refresh_data

        new_access_token = refresh_data["access_token"]

        # Test logout with new access token
        headers = {"Authorization": f"Bearer {new_access_token}"}
        res_logout = await client.post("/api/v1/auth/logout", headers=headers)
        assert res_logout.status_code == 200
        assert res_logout.json()["success"] is True


@pytest.mark.asyncio
async def test_auth_refresh_invalid_token():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res_refresh = await client.post("/api/v1/auth/refresh", json={"refresh_token": "invalid.jwt.token"})
        assert res_refresh.status_code == 401
