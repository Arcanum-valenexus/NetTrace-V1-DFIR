import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token


@pytest.mark.asyncio
async def test_rbac_unauthenticated_access_denied():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Request protected endpoints without Bearer token
        res_cases = await client.get("/api/v1/cases")
        assert res_cases.status_code == 401

        res_incidents = await client.get("/api/v1/incidents")
        assert res_incidents.status_code == 401

        res_settings = await client.get("/api/v1/settings")
        assert res_settings.status_code == 401


@pytest.mark.asyncio
async def test_rbac_read_only_user_forbidden_write_access():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create token for Read Only user (only has cases:read and incidents:read)
        read_only_token = create_access_token(
            subject="user-readonly-123",
            email="readonly@nettrace.security",
            role="Read Only",
            permissions=["cases:read", "incidents:read"]
        )
        headers = {"Authorization": f"Bearer {read_only_token}"}

        # GET cases should succeed (200)
        res_get_cases = await client.get("/api/v1/cases", headers=headers)
        assert res_get_cases.status_code == 200

        # POST cases requires cases:write -> should return 403 Forbidden
        case_payload = {
            "title": "Unauthorized Case Creation",
            "severity": "High",
            "incidentType": "Malware Analysis",
            "affectedAssets": ["HOST-999"]
        }
        res_post_cases = await client.post("/api/v1/cases", json=case_payload, headers=headers)
        assert res_post_cases.status_code == 403
        assert res_post_cases.json()["detail"] == "Insufficient permissions for this operation"


@pytest.mark.asyncio
async def test_rbac_super_admin_unrestricted_access():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        admin_token = create_access_token(
            subject="user-admin-001",
            email="admin@nettrace.security",
            role="Super Admin",
            permissions=["cases:read", "cases:write", "incidents:read", "incidents:write", "evidence:upload", "evidence:delete", "pcap:analyze", "reports:generate", "system:settings"]
        )
        headers = {"Authorization": f"Bearer {admin_token}"}

        res_settings = await client.get("/api/v1/settings", headers=headers)
        assert res_settings.status_code == 200
