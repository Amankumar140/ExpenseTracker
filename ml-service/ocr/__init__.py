"""OCR module containing preprocessing, PaddleOCR singleton, regex parser, and Pydantic schemas."""

from .preprocessing import preprocess_image
from .paddle_service import get_paddle_service, PaddleReceiptOCR
from .parser import (
    extract_total,
    extract_tax,
    extract_date,
    extract_currency,
    extract_invoice_number,
    extract_payment_method,
)
from .schemas import OcrResponse, ParsedFields

__all__ = [
    "preprocess_image",
    "get_paddle_service",
    "PaddleReceiptOCR",
    "extract_total",
    "extract_tax",
    "extract_date",
    "extract_currency",
    "extract_invoice_number",
    "extract_payment_method",
    "OcrResponse",
    "ParsedFields",
]
