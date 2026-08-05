from typing import Optional
from pydantic import EmailStr, Field
from app.schemas.base import BaseSchema


class LoginRequest(BaseSchema):
    email: EmailStr
    password: str


class UserRegisterRequest(BaseSchema):
    fullName: str
    email: EmailStr
    password: str = Field(..., min_length=6, description="Investigator password must be at least 6 characters")
    role: Optional[str] = "Lead DFIR Investigator"



class RefreshTokenRequest(BaseSchema):
    refresh_token: Optional[str] = None
    refreshToken: Optional[str] = None

    @property
    def token(self) -> str:
        return self.refresh_token or self.refreshToken or ""


class PasswordChangeRequest(BaseSchema):
    current_password: str
    new_password: str


class AuthTokenResponse(BaseSchema):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int
