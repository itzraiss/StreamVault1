from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl
from typing import List, Optional


class Settings(BaseSettings):
    # Base configuration
    BASE_URL: AnyHttpUrl = "https://acteia.ca/br"
    USER_AGENT: str = (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/125.0 Safari/537.36"
    )
    REQUEST_TIMEOUT_SECONDS: float = 15.0
    MAX_CONCURRENCY: int = 6

    # Optional cookie for authenticated access (set from .env)
    AUTH_COOKIE: Optional[str] = None

    # Respect robots.txt (set to false only if you have explicit authorization)
    RESPECT_ROBOTS: bool = True

    # Caching
    CACHE_TTL_SECONDS: int = 600
    CACHE_MAXSIZE: int = 2048

    # API
    CORS_ALLOW_ORIGINS: List[str] = ["*"]
    RATE_LIMIT: str = "60/minute"

    # Images
    IMAGE_MAX_WIDTH: int = 720
    IMAGE_DEFAULT_QUALITY: int = 78

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()  # type: ignore