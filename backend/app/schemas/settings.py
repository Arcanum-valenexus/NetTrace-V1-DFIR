from app.schemas.base import BaseSchema


class SystemSettingsResponse(BaseSchema):
    max_upload_size_mb: int = 500
    retention_days: int = 90
    gemini_ai_enabled: bool = True
    auto_pcap_parsing: bool = True
