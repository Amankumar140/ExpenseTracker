"""Pydantic schemas for LLM-powered receipt extraction output."""

from typing import Optional
from pydantic import BaseModel, Field


# Fixed category list — the LLM must select from these
ALLOWED_CATEGORIES = [
    "Food & Dining",
    "Groceries",
    "Transportation",
    "Shopping",
    "Utilities",
    "Healthcare",
    "Entertainment",
    "Education",
    "Travel",
    "Personal Care",
    "Home & Garden",
    "Electronics",
    "Clothing & Apparel",
    "Fuel & Gas",
    "Subscriptions",
    "Office Supplies",
    "Gifts & Donations",
    "Insurance",
    "Repairs & Maintenance",
    "Other",
]


class ReceiptExtraction(BaseModel):
    """Structured output schema for LLM receipt extraction.

    The LLM returns this after analysing OCR text + regex pre-extracted fields.
    """

    merchant: Optional[str] = Field(
        default=None,
        description="Normalized merchant or store name (e.g. 'Starbucks', 'Amazon')",
    )
    category: Optional[str] = Field(
        default=None,
        description="Expense category from the allowed list",
    )
    merchant_confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Confidence score for merchant identification (0.0 - 1.0)",
    )
    category_confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Confidence score for category classification (0.0 - 1.0)",
    )
    corrected_total: Optional[float] = Field(
        default=None,
        description="Total amount — only set if regex missed it",
    )
    corrected_tax: Optional[float] = Field(
        default=None,
        description="Tax amount — only set if regex missed it",
    )
    corrected_date: Optional[str] = Field(
        default=None,
        description="Date in YYYY-MM-DD format — only set if regex missed it",
    )
    corrected_currency: Optional[str] = Field(
        default=None,
        description="ISO currency code (e.g. INR, USD) — only set if regex missed it",
    )
    notes: Optional[str] = Field(
        default=None,
        description="Short one-line description of the expense",
    )
