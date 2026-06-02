"""Global application settings and configuration parameters."""

import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel, Field

# Load .env from ml-service root (two levels up from config/)
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)


class Settings(BaseModel):
    # API Config
    HOST: str = Field(default=os.getenv("HOST", "0.0.0.0"))
    PORT: int = Field(default=int(os.getenv("PORT", "8000")))
    LOG_LEVEL: str = Field(default=os.getenv("LOG_LEVEL", "INFO"))

    # OCR Preprocessing Config
    MAX_SIDE_FOR_OCR: int = 1000  # Max image side length (pixels) for CPU PaddleOCR
    MIN_WIDTH_FOR_OCR: int = 600   # Minimum image width (pixels) for OCR readability
    GAUSSIAN_KERNEL_SIZE: tuple[int, int] = (5, 5)
    ADAPTIVE_BLOCK_SIZE: int = 11
    ADAPTIVE_C: int = 2

    # PaddleOCR Runtime Config
    PADDLE_LANG: str = "en"
    FLAGS_USE_MKLDNN: str = "0"
    FLAGS_ENABLE_PIR_API: str = "0"
    FLAGS_ENABLE_PIR_IN_EXECUTOR: str = "0"

    # ── Mistral / LangChain LLM Config ──────────────────────────
    MISTRAL_API_KEY: str = Field(default=os.getenv("MISTRAL_API_KEY", ""))
    MISTRAL_MODEL: str = Field(default=os.getenv("MISTRAL_MODEL", "mistral-small-latest"))
    MISTRAL_TEMPERATURE: float = Field(default=float(os.getenv("MISTRAL_TEMPERATURE", "0.1")))
    MISTRAL_TIMEOUT: int = Field(default=int(os.getenv("MISTRAL_TIMEOUT", "30")))
    MISTRAL_MAX_RETRIES: int = Field(default=int(os.getenv("MISTRAL_MAX_RETRIES", "1")))
    LLM_ENABLED: bool = Field(default=os.getenv("LLM_ENABLED", "true").lower() in ("true", "1", "yes"))


settings = Settings()
