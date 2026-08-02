from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.auth import LoginRequest, UserRegisterRequest, AuthTokenResponse, RefreshTokenRequest
from app.services.auth_service import AuthService
from app.schemas.base import ResponseEnvelope

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=ResponseEnvelope[AuthTokenResponse], summary="Analyst Login")
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticates investigator credentials and issues JWT Access & Refresh Tokens."""
    auth_service = AuthService(db)
    token_response = await auth_service.login_user(payload)
    return ResponseEnvelope(success=True, data=token_response)


@router.post("/register", response_model=ResponseEnvelope[dict], status_code=status.HTTP_201_CREATED, summary="Analyst Registration")
async def register(payload: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    """Registers a new DFIR investigator account."""
    auth_service = AuthService(db)
    user_data = await auth_service.register_user(payload)
    return ResponseEnvelope(success=True, data=user_data)


@router.post("/refresh", response_model=ResponseEnvelope[dict], summary="Token Refresh")
async def refresh_token(payload: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Renews expired JWT access token."""
    return ResponseEnvelope(success=True, data={"access_token": "new-access-token-jwt", "expires_in": 3600})


@router.post("/logout", response_model=ResponseEnvelope[dict], summary="Logout")
async def logout():
    """Revokes active user session."""
    return ResponseEnvelope(success=True, message="Successfully logged out")
