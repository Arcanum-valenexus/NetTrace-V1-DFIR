from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine
)
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings


# Create SQLAlchemy 2.0 Async Engine
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
    future=True,
    pool_pre_ping=True,
)

# Async Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    """Base metadata class for SQLAlchemy 2.0 models."""
    pass


_schema_initialized = False


async def ensure_db_schema() -> None:
    """Create database schema if it has not been created yet."""
    global _schema_initialized
    if _schema_initialized:
        return

    # Import models to register SQLAlchemy metadata before creation.
    import app.models  # noqa: F401

    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    _schema_initialized = True


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency injection provider for Async SQLAlchemy Session."""
    if settings.ENVIRONMENT == "development":
        await ensure_db_schema()

    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
