from typing import Optional
from app.schemas.base import BaseSchema


class ProfileResponse(BaseSchema):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str
    avatar_url: Optional[str] = None
