"""Groq AI service for ultra-fast LLM receipt extraction via LangChain.

Uses fast models on Groq (such as qwen/qwen3.8-27b or openai/gpt-oss-20b).
Graceful fallback: on any error returns None (never crashes the API).
"""

import logging
from typing import Optional

from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.runnables import RunnableSequence
from langchain_groq import ChatGroq

from ai.prompts import get_receipt_prompt
from ai.schemas import ReceiptExtraction
from config.settings import settings
from ocr.schemas import ParsedFields

logger = logging.getLogger(__name__)


class GroqReceiptService:
    """Reusable LangChain -> Groq AI service for receipt extraction."""

    def __init__(self) -> None:
        self._parser = PydanticOutputParser(pydantic_object=ReceiptExtraction)
        self._model = ChatGroq(
            model=settings.GROQ_MODEL,
            temperature=settings.GROQ_TEMPERATURE,
            timeout=settings.GROQ_TIMEOUT,
            max_retries=settings.GROQ_MAX_RETRIES,
            api_key=settings.GROQ_API_KEY,
        )
        self._prompt = get_receipt_prompt()

        # Primary chain: prompt -> model -> parser
        self._chain: RunnableSequence = self._prompt | self._model | self._parser

    async def extract(
        self,
        ocr_text: str,
        regex_fields: ParsedFields,
    ) -> Optional[ReceiptExtraction]:
        """Invoke Groq AI to extract structured receipt data."""
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
                "Groq LLM extraction OK — merchant=%s category=%s",
                result.merchant,
                result.category,
            )
            return result
        except Exception as e:
            logger.warning("Primary Groq chain failed: %s — attempting raw parse fallback", e)

        # Attempt 2: get raw text from model and try manual parse
        try:
            raw_response = await (self._prompt | self._model).ainvoke(prompt_vars)
            raw_text = raw_response.content if hasattr(raw_response, "content") else str(raw_response)
            result = self._parser.parse(raw_text)
            logger.info("Groq fallback parse succeeded — merchant=%s", result.merchant)
            return result
        except Exception as e2:
            logger.error("Groq fallback parse also failed: %s — returning None", e2)
            return None


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------
_groq_service_instance: Optional[GroqReceiptService] = None


def get_groq_service() -> GroqReceiptService:
    """Get or create the singleton GroqReceiptService instance."""
    global _groq_service_instance
    if _groq_service_instance is None:
        if not settings.GROQ_API_KEY:
            logger.warning("GROQ_API_KEY not set — Groq extraction will be unavailable")
        _groq_service_instance = GroqReceiptService()
        logger.info("GroqReceiptService initialized (model=%s)", settings.GROQ_MODEL)
    return _groq_service_instance
