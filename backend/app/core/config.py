from typing import List, Union
from pydantic import AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    # General App Configuration
    PROJECT_NAME: str = "NetTrace V1.0 Enterprise Backend"
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"

    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "https://net-trace-v1-dfir.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return [
            "https://net-trace-v1-dfir.vercel.app",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
        ]

    # Database Settings
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./nettrace.db",
        description="Async database connection string"
    )
    SYNC_DATABASE_URL: str = Field(
        default="sqlite:///./nettrace.db",
        description="Sync database connection string for Alembic or local tooling"
    )

    # Supabase Integration
    SUPABASE_URL: str = Field(default="", description="Supabase Project URL")
    SUPABASE_ANON_KEY: str = Field(default="", description="Supabase Anon/Public Key")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(default="", description="Supabase Service Role Secret")

    # Security & JWT Authentication
    JWT_SECRET: str = Field(default="super-secret-jwt-key-change-in-production-min-32-chars", description="JWT Signing Secret")
    JWT_REFRESH_SECRET: str = Field(default="super-secret-refresh-key-change-in-production-min-32-chars", description="JWT Refresh Signing Secret")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Storage & Upload Limits
    STORAGE_BUCKET: str = Field(default="nettrace-evidence", description="Supabase or S3 storage bucket name")
    UPLOAD_DIRECTORY: str = Field(default="./uploads", description="Local directory for temporary upload processing")
    MAX_UPLOAD_SIZE: int = Field(default=524288000, description="Max upload size in bytes (500MB)")

    # AI Integration (Google Gemini)
    GOOGLE_GEMINI_API_KEY: str = Field(default="", description="Google Gemini API Key")

    # SMTP Configuration
    SMTP_HOST: str = Field(default="smtp.gmail.com", description="SMTP Mail Server Host")
    SMTP_PORT: int = Field(default=587, description="SMTP Server Port")
    SMTP_USER: str = Field(default="", description="SMTP Auth User")
    SMTP_PASSWORD: str = Field(default="", description="SMTP Auth Password")


settings = Settings()
