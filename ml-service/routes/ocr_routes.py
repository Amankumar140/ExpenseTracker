"""FastAPI route handlers for OCR processing and health checks."""

import os
import tempfile
import logging
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field

from config.settings import settings
from ocr.schemas import OcrResponse
from services.ocr_service import process_receipt_image, process_receipt_image_full

logger = logging.getLogger(__name__)
router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    engine: str = "PaddleOCR"
    version: str = "3.0.0"
    llm_enabled: bool = Field(default=False, description="Whether LLM enrichment is active")
    llm_model: str = Field(default="", description="Mistral model name if LLM is enabled")


@router.post(
    "/ocr",
    response_model=OcrResponse,
    summary="Extract text & parsed fields from receipt image",
    description=(
        "Upload a receipt image. Preprocesses with OpenCV, runs PaddleOCR, "
        "extracts deterministic fields via regex, and enriches with Mistral AI."
    ),
)
async def run_ocr_endpoint(file: UploadFile = File(...)):
    """Extract text from an uploaded receipt image with optional LLM enrichment."""
    allowed_types = {"image/jpeg", "image/png", "image/tiff", "image/bmp", "image/webp"}
    if file.content_type and file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Allowed: {', '.join(allowed_types)}",
        )

    tmp_path = None
    try:
        suffix = os.path.splitext(file.filename or "image.jpg")[1] or ".jpg"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Use the full async pipeline (OCR + Regex + LLM) when LLM is enabled,
        # otherwise fall back to sync OCR + Regex only.
        if settings.LLM_ENABLED:
            response = await process_receipt_image_full(tmp_path)
        else:
            response = process_receipt_image(tmp_path)

        return response

    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
)
async def health_check():
    """Check microservice health status, including LLM availability."""
    return HealthResponse(
        status="healthy",
        llm_enabled=settings.LLM_ENABLED and bool(settings.MISTRAL_API_KEY),
        llm_model=settings.MISTRAL_MODEL if settings.LLM_ENABLED else "",
    )
