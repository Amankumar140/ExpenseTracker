"""Prompt templates for LLM-based receipt extraction.

All prompts are stored here — never hardcoded in service or pipeline code.
"""

from langchain_core.prompts import ChatPromptTemplate

from ai.schemas import ALLOWED_CATEGORIES


_CATEGORIES_STR = "\n".join(f"  - {cat}" for cat in ALLOWED_CATEGORIES)


RECEIPT_EXTRACTION_SYSTEM_PROMPT = f"""\
You are a precise receipt data extraction assistant.

Your job is to analyse OCR text from a scanned receipt and return structured JSON.

## Rules
1. You will receive two inputs:
   - **OCR Text**: Raw text extracted by an OCR engine (may contain errors).
   - **Known Fields**: Fields already extracted by deterministic regex (these are trustworthy).
2. DO NOT re-extract fields that are already provided in Known Fields unless they are null/missing.
3. For missing fields (null values in Known Fields), attempt to extract them from the OCR text.
4. NEVER hallucinate or fabricate values. If a value cannot be determined, set it to null.
5. Correct obvious OCR errors when identifying the merchant name (e.g. "5tarbucks" → "Starbucks").
6. Return confidence scores between 0.0 and 1.0 for merchant and category identification.
7. You MUST select the category from this fixed list:
{_CATEGORIES_STR}
8. Return ONLY valid JSON matching the schema. No markdown, no explanation, no extra text.
9. For dates, use YYYY-MM-DD format.
10. For currency, use ISO codes (INR, USD, EUR, GBP, etc.).

{{format_instructions}}"""


RECEIPT_EXTRACTION_HUMAN_PROMPT = """\
## OCR Text
```
{ocr_text}
```

## Known Fields (from regex extraction)
- Total: {regex_total}
- Tax: {regex_tax}
- Date: {regex_date}
- Currency: {regex_currency}
- Invoice Number: {regex_invoice_number}
- Payment Method: {regex_payment_method}

Analyse the receipt and return the structured JSON."""


def get_receipt_prompt() -> ChatPromptTemplate:
    """Build and return the ChatPromptTemplate for receipt extraction."""
    return ChatPromptTemplate.from_messages(
        [
            ("system", RECEIPT_EXTRACTION_SYSTEM_PROMPT),
            ("human", RECEIPT_EXTRACTION_HUMAN_PROMPT),
        ]
    )
