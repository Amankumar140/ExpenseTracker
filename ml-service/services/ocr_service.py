"""OCR Service layer orchestrating receipt pipeline calls."""

from pathlib import Path
from ocr.schemas import OcrResponse
from pipeline import run_receipt_pipeline, run_receipt_pipeline_full


def process_receipt_image(file_path: str | Path) -> OcrResponse:
    """Business logic service entrypoint for processing receipt images (sync, OCR + regex only)."""
    return run_receipt_pipeline(file_path)


async def process_receipt_image_full(file_path: str | Path) -> OcrResponse:
    """Business logic service entrypoint with LLM enrichment (async, OCR + regex + LLM)."""
    return await run_receipt_pipeline_full(file_path)
