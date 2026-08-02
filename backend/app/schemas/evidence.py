from datetime import datetime
from typing import Optional
from app.schemas.base import BaseSchema


class EvidenceBase(BaseSchema):
    file_name: str
    file_size_bytes: int
    file_type: str
    sha256_hash: str
    chain_of_custody_verified: bool = True


class EvidenceCreate(EvidenceBase):
    pass


class EvidenceResponse(EvidenceBase):
    id: str
    uploaded_at: datetime
