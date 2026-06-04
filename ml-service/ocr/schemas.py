"""Pydantic schemas for OCR models and receipt extraction results."""

from typing import Any, Optional
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x: float = 0.0
    y: float = 0.0
    width: float = 0.0
    height: float = 0.0


class OCRLine(BaseModel):
    text: str
    confidence: float = 1.0
    bbox: BoundingBox = Field(default_factory=BoundingBox)
    polygon: list[list[float]] = Field(default_factory=list)
    page: int = 1


class OCRPage(BaseModel):
    number: int = 1
    lines: list[OCRLine] = Field(default_factory=list)


class OCRDataLayout(BaseModel):
    pages: list[OCRPage] = Field(default_factory=list)
    lines: list[OCRLine] = Field(default_factory=list)


class ParsedFields(BaseModel):
    total: Optional[float] = None
    tax: Optional[float] = None
    date: Optional[str] = None
    currency: Optional[str] = None
    invoice_number: Optional[str] = None
    payment_method: Optional[str] = None


class ProcessingTime(BaseModel):
    """Timing breakdown for each pipeline stage (in milliseconds)."""
    ocr_ms: float = 0.0
    regex_ms: float = 0.0
    llm_ms: float = 0.0
    total_ms: float = 0.0


class OcrResponse(BaseModel):
    # ── Existing fields (backward-compatible) ───────────────────
    extracted_text: str = Field(description="Raw text extracted by PaddleOCR")
    ocr_confidence: float = Field(default=0.85, description="Mean OCR confidence (0.0 - 1.0)")
    ocr_data: dict[str, Any] = Field(default_factory=dict, description="Structured spatial OCR layout")
    parsed_fields: ParsedFields = Field(default_factory=ParsedFields, description="Deterministic regex parsed fields")

    # ── LLM-enriched fields ─────────────────────────────────────
    merchant: Optional[str] = Field(default=None, description="LLM-identified merchant name")
    category: Optional[str] = Field(default=None, description="LLM-identified expense category")
    merchant_confidence: float = Field(default=0.0, description="Merchant identification confidence (0.0 - 1.0)")
    category_confidence: float = Field(default=0.0, description="Category classification confidence (0.0 - 1.0)")
    notes: Optional[str] = Field(default=None, description="LLM-generated expense description")

    # ── Metadata ────────────────────────────────────────────────
    processing_time: ProcessingTime = Field(default_factory=ProcessingTime, description="Per-stage timing breakdown")
    llm_used: bool = Field(default=False, description="Whether LLM enrichment was applied")
    warnings: list[str] = Field(default_factory=list, description="Pipeline warnings (e.g. LLM unavailable)")
