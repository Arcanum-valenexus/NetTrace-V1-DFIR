import uuid

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import get_db, Base
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(test_engine, expire_on_commit=False, class_=AsyncSession)


def _generate_test_user_payload() -> dict:
    unique_id = uuid.uuid4().hex[:8]
    return {
        "fullName": f"Test Analyst {unique_id}",
        "email": f"test.analyst+{unique_id}@nettrace.security",
        "password": "Password123!",
        "role": "Lead DFIR Investigator",
    }


async def get_authenticated_headers(client: AsyncClient) -> dict:
    payload = _generate_test_user_payload()
    await client.post("/api/v1/auth/register", json=payload)
    login_payload = {"email": payload["email"], "password": payload["password"]}
    res_login = await client.post("/api/v1/auth/login", json=login_payload)
    token = res_login.json().get("data", {}).get("access_token")
    return {"Authorization": f"Bearer {token}"} if token else {}


async def override_get_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with TestSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
async def async_client():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client
