"""Single orchestration pipeline layer for receipt OCR processing.

Flow (sync):
  Image File -> OpenCV Preprocess -> PaddleOCR Engine -> Regex Deterministic Parser -> Structured OcrResponse

Flow (async, LLM-enriched):
  Image File -> OpenCV Preprocess -> PaddleOCR Engine -> Regex Parser -> Mistral AI -> Merge -> OcrResponse
"""

import logging
import time
from pathlib import Path
from typing import Optional

import numpy as np

from ocr.preprocessing import preprocess_image
from ocr.paddle_service import get_paddle_service
from ocr.parser import (
    extract_total,
    extract_tax,
    extract_date,
    extract_currency,
    extract_invoice_number,
    extract_payment_method,
)
from ocr.schemas import OcrResponse, ParsedFields, ProcessingTime
from utils.string_utils import normalize_line_spacing
from config.settings import settings

logger = logging.getLogger(__name__)


class ReceiptPipeline:
    """Orchestrates OpenCV preprocessing, PaddleOCR, deterministic regex extraction,
    and optional LLM enrichment via Mistral AI."""

    def process_image(self, image_path: str | Path) -> OcrResponse:
        """Process receipt image through the OCR + regex pipeline (sync, no LLM)."""
        # 1. OpenCV Image Preprocessing
        preprocessed_img: np.ndarray = preprocess_image(str(image_path))

        # 2. PaddleOCR Inference
        paddle_service = get_paddle_service()
        pages = paddle_service.recognize(preprocessed_img)

        # 3. Normalize line spacing
        for page in pages:
            for line in page.get("lines", []):
                line["text"] = normalize_line_spacing(line.get("text", ""))

        lines = [line for page in pages for line in page.get("lines", [])]
        extracted_text = "\n".join(line["text"] for line in lines)
        ocr_confidence = float(np.mean([line["confidence"] for line in lines])) if lines else 0.0

        # 4. Deterministic Regex Field Extraction
        parsed_fields = ParsedFields(
            total=extract_total(extracted_text),
            tax=extract_tax(extracted_text),
            date=extract_date(extracted_text),
            currency=extract_currency(extracted_text),
            invoice_number=extract_invoice_number(extracted_text),
            payment_method=extract_payment_method(extracted_text),
        )

        return OcrResponse(
            extracted_text=extracted_text,
            ocr_confidence=ocr_confidence,
            ocr_data={"pages": pages, "lines": lines},
            parsed_fields=parsed_fields,
        )

    async def process_image_full(self, image_path: str | Path) -> OcrResponse:
        """Process receipt image through the full pipeline: OCR + Regex + LLM + Merge.

        Falls back to regex-only results if LLM is unavailable or fails.
        """
        pipeline_start = time.perf_counter()
        warnings: list[str] = []

        # ── Stage 1: OCR ────────────────────────────────────────
        ocr_start = time.perf_counter()
        preprocessed_img: np.ndarray = preprocess_image(str(image_path))

        paddle_service = get_paddle_service()
        pages = paddle_service.recognize(preprocessed_img)

        for page in pages:
            for line in page.get("lines", []):
                line["text"] = normalize_line_spacing(line.get("text", ""))

        lines = [line for page in pages for line in page.get("lines", [])]
        extracted_text = "\n".join(line["text"] for line in lines)
        ocr_confidence = float(np.mean([line["confidence"] for line in lines])) if lines else 0.0
        ocr_ms = (time.perf_counter() - ocr_start) * 1000

        # ── Stage 2: Regex ──────────────────────────────────────
        regex_start = time.perf_counter()
        parsed_fields = ParsedFields(
            total=extract_total(extracted_text),
            tax=extract_tax(extracted_text),
            date=extract_date(extracted_text),
            currency=extract_currency(extracted_text),
            invoice_number=extract_invoice_number(extracted_text),
            payment_method=extract_payment_method(extracted_text),
        )
        regex_ms = (time.perf_counter() - regex_start) * 1000

        # ── Stage 3: LLM Enrichment (optional) ─────────────────
        llm_ms = 0.0
        llm_used = False
        merchant: Optional[str] = None
        category: Optional[str] = None
        merchant_confidence = 0.0
        category_confidence = 0.0
        notes: Optional[str] = None

        if settings.LLM_ENABLED and settings.MISTRAL_API_KEY:
            try:
                from ai.mistral_service import get_mistral_service

                llm_start = time.perf_counter()
                mistral = get_mistral_service()
                extraction = await mistral.extract(extracted_text, parsed_fields)
                llm_ms = (time.perf_counter() - llm_start) * 1000

                if extraction is not None:
                    llm_used = True
                    merchant = extraction.merchant
                    category = extraction.category
                    merchant_confidence = extraction.merchant_confidence
                    category_confidence = extraction.category_confidence
                    notes = extraction.notes

                    # Merge: LLM fills gaps for deterministic fields regex missed
                    parsed_fields = self._merge_fields(parsed_fields, extraction)

                    logger.info(
                        "LLM enrichment complete in %.0fms — merchant=%s category=%s",
                        llm_ms,
                        merchant,
                        category,
                    )
                else:
                    warnings.append("LLM returned no result — using regex-only data")
            except Exception as e:
                llm_ms = (time.perf_counter() - llm_start) * 1000 if 'llm_start' in dir() else 0.0
                logger.error("LLM enrichment failed: %s — falling back to regex-only", e)
                warnings.append(f"LLM unavailable: {e}")
        elif not settings.LLM_ENABLED:
            warnings.append("LLM disabled via LLM_ENABLED=false")
        elif not settings.MISTRAL_API_KEY:
            warnings.append("MISTRAL_API_KEY not configured — LLM enrichment skipped")

        total_ms = (time.perf_counter() - pipeline_start) * 1000
        logger.info(
            "Pipeline complete: ocr=%.0fms regex=%.0fms llm=%.0fms total=%.0fms",
            ocr_ms, regex_ms, llm_ms, total_ms,
        )

        return OcrResponse(
            extracted_text=extracted_text,
            ocr_confidence=ocr_confidence,
            ocr_data={"pages": pages, "lines": lines},
            parsed_fields=parsed_fields,
            merchant=merchant,
            category=category,
            merchant_confidence=merchant_confidence,
            category_confidence=category_confidence,
            notes=notes,
            processing_time=ProcessingTime(
                ocr_ms=round(ocr_ms, 1),
                regex_ms=round(regex_ms, 1),
                llm_ms=round(llm_ms, 1),
                total_ms=round(total_ms, 1),
            ),
            llm_used=llm_used,
            warnings=warnings,
        )

    @staticmethod
    def _merge_fields(regex_fields: ParsedFields, extraction) -> ParsedFields:
        """Merge LLM corrections into regex fields.

        Regex has higher priority for deterministic values.
        LLM only fills fields that regex returned as None.
        """
        return ParsedFields(
            total=regex_fields.total if regex_fields.total is not None else extraction.corrected_total,
            tax=regex_fields.tax if regex_fields.tax is not None else extraction.corrected_tax,
            date=regex_fields.date if regex_fields.date is not None else extraction.corrected_date,
            currency=regex_fields.currency if regex_fields.currency is not None else extraction.corrected_currency,
            invoice_number=regex_fields.invoice_number,
            payment_method=regex_fields.payment_method,
        )


_pipeline_instance = ReceiptPipeline()


def run_receipt_pipeline(image_path: str | Path) -> OcrResponse:
    """Convenience functional wrapper for sync pipeline execution (OCR + regex only)."""
    return _pipeline_instance.process_image(image_path)


async def run_receipt_pipeline_full(image_path: str | Path) -> OcrResponse:
    """Convenience functional wrapper for async full pipeline (OCR + regex + LLM)."""
    return await _pipeline_instance.process_image_full(image_path)
