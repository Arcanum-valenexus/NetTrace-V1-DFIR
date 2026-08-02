from typing import Optional
from pydantic import EmailStr
from app.schemas.base import BaseSchema


class LoginRequest(BaseSchema):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseSchema):
    refresh_token: str


class AuthTokenResponse(BaseSchema):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int
