from typing import Optional
from pydantic import EmailStr
from app.schemas.base import BaseSchema


class LoginRequest(BaseSchema):
    email: EmailStr
    password: str


class UserRegisterRequest(BaseSchema):
    fullName: str
    email: EmailStr
    password: str
    role: Optional[str] = "Lead DFIR Investigator"


class RefreshTokenRequest(BaseSchema):
    refresh_token: str


class PasswordChangeRequest(BaseSchema):
    current_password: str
    new_password: str


class AuthTokenResponse(BaseSchema):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int
