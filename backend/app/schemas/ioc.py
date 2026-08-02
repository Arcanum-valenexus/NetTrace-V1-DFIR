from typing import List
from app.schemas.base import BaseSchema


class IOCExtractRequest(BaseSchema):
    raw_text: str


class IOCExtractResponse(BaseSchema):
    extracted_ips: List[str]
    extracted_hashes: List[str]
    extracted_domains: List[str] = []
    count: int
