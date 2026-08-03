from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, async_engine
from app.core.logging import setup_logging, logger
from app.middleware.logging_middleware import RequestLoggingMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.middleware.exception_handler import register_exception_handlers
from app.api.v1.router import api_v1_router
import app.models  # noqa: F401  # Ensure model classes are registered with SQLAlchemy metadata before creating schema


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager (startup & shutdown events)."""
    setup_logging(log_level="INFO")
    logger.info(
        "Starting NetTrace Enterprise Backend Engine",
        environment=settings.ENVIRONMENT,
        version="1.0.0",
    )

    if settings.ENVIRONMENT == "development":
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database schema ensured for development environment")

    yield
    logger.info("Shutting down NetTrace Enterprise Backend Engine")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise Digital Forensics & Incident Response Platform API Engine",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# 1. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Security Headers & Request Logging Middlewares
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)

# 3. Centralized Exception Handlers
register_exception_handlers(app)

# 4. Include V1 Router Aggregator
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


def custom_openapi():
    """Generates complete OpenAPI 3.0 documentation with Security Schemes and Error Schemas."""
    if app.openapi_schema:
        return app.openapi_schema
    
    from fastapi.openapi.utils import get_openapi
    openapi_schema = get_openapi(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        description="Enterprise Digital Forensics & Incident Response Platform API Engine with complete OpenAPI documentation.",
        routes=app.routes,
    )
    
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Provide JWT Access Token issued via /api/v1/auth/login",
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

