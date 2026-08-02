from fastapi import APIRouter
from app.api.v1.auth.router import router as auth_router
from app.api.v1.users.router import router as users_router
from app.api.v1.cases.router import router as cases_router
from app.api.v1.incidents.router import router as incidents_router
from app.api.v1.evidence.router import router as evidence_router
from app.api.v1.reports.router import router as reports_router
from app.api.v1.pcap.router import router as pcap_router
from app.api.v1.ioc.router import router as ioc_router
from app.api.v1.dashboard.router import router as dashboard_router
from app.api.v1.profile.router import router as profile_router
from app.api.v1.settings.router import router as settings_router

api_v1_router = APIRouter()

@api_v1_router.get("/health", tags=["Health"])
async def health_check():
    """Foundational health check endpoint."""
    return {
        "status": "healthy",
        "service": "NetTrace Enterprise DFIR Backend Engine",
        "version": "1.0.0",
        "tagline": "Trace Every Packet. Reveal Every Attack."
    }

# Register V1 Sub-routers
api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(cases_router)
api_v1_router.include_router(incidents_router)
api_v1_router.include_router(evidence_router)
api_v1_router.include_router(reports_router)
api_v1_router.include_router(pcap_router)
api_v1_router.include_router(ioc_router)
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(profile_router)
api_v1_router.include_router(settings_router)
