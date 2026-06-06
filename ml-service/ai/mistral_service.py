"""Mistral AI service for LLM-powered receipt extraction via LangChain.

Responsibilities:
  - Receive OCR text and regex-extracted fields.
  - Build prompt, invoke Mistral via LangChain, parse structured response.
  - Graceful fallback: on any error returns None (never crashes the API).

No business logic. No database code.
"""

import logging
from typing import Optional

from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.runnables import RunnableSequence
from langchain_mistralai import ChatMistralAI

from ai.prompts import get_receipt_prompt
from ai.schemas import ReceiptExtraction
from config.settings import settings
from ocr.schemas import ParsedFields

logger = logging.getLogger(__name__)


class MistralReceiptService:
    """Reusable LangChain → Mistral AI service for receipt extraction."""

    def __init__(self) -> None:
        self._parser = PydanticOutputParser(pydantic_object=ReceiptExtraction)
        self._model = ChatMistralAI(
            model=settings.MISTRAL_MODEL,
            temperature=settings.MISTRAL_TEMPERATURE,
            timeout=settings.MISTRAL_TIMEOUT,
            max_retries=settings.MISTRAL_MAX_RETRIES,
            api_key=settings.MISTRAL_API_KEY,
        )
        self._prompt = get_receipt_prompt()

        # Primary chain: prompt → model → parser
        self._chain: RunnableSequence = self._prompt | self._model | self._parser

    async def extract(
        self,
        ocr_text: str,
        regex_fields: ParsedFields,
    ) -> Optional[ReceiptExtraction]:
        """Invoke Mistral AI to extract structured receipt data.

        Args:
            ocr_text: Raw OCR text from PaddleOCR.
            regex_fields: Pre-extracted deterministic fields from regex parser.

        Returns:
            ReceiptExtraction on success, None on any failure.
        """
        if not ocr_text or not ocr_text.strip():
            logger.warning("Empty OCR text — skipping LLM extraction")
            return None

        prompt_vars = {
            "ocr_text": ocr_text[:4000],  # Truncate to avoid token overflow
            "regex_total": str(regex_fields.total) if regex_fields.total is not None else "null",
            "regex_tax": str(regex_fields.tax) if regex_fields.tax is not None else "null",
            "regex_date": regex_fields.date or "null",
            "regex_currency": regex_fields.currency or "null",
            "regex_invoice_number": regex_fields.invoice_number or "null",
            "regex_payment_method": regex_fields.payment_method or "null",
            "format_instructions": self._parser.get_format_instructions(),
        }

        # Attempt 1: primary chain
        try:
            result = await self._chain.ainvoke(prompt_vars)
            logger.info(
                "LLM extraction OK — merchant=%s category=%s",
                result.merchant,
                result.category,
            )
            return result
        except Exception as e:
            logger.warning("Primary LLM chain failed: %s — attempting raw parse fallback", e)

        # Attempt 2: get raw text from model and try manual parse
        try:
            raw_response = await (self._prompt | self._model).ainvoke(prompt_vars)
            raw_text = raw_response.content if hasattr(raw_response, "content") else str(raw_response)
            result = self._parser.parse(raw_text)
            logger.info("Fallback parse succeeded — merchant=%s", result.merchant)
            return result
        except Exception as e2:
            logger.error("LLM fallback parse also failed: %s — returning None", e2)
            return None


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------
_service_instance: Optional[MistralReceiptService] = None


def get_mistral_service() -> MistralReceiptService:
    """Get or create the singleton MistralReceiptService instance."""
    global _service_instance
    if _service_instance is None:
        if not settings.MISTRAL_API_KEY:
            logger.warning("MISTRAL_API_KEY not set — LLM extraction will be unavailable")
        _service_instance = MistralReceiptService()
        logger.info("MistralReceiptService initialized (model=%s)", settings.MISTRAL_MODEL)
    return _service_instance
