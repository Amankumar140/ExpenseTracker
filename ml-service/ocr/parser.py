"""Deterministic regex extraction module for key receipt fields.

Contains rule-based regex parsing for totals, taxes, dates, currency symbols,
invoice numbers, and payment methods. Does NOT contain AI or category predictions.
"""

import re
from typing import Optional

from utils.currency_utils import normalize_currency_value
from utils.date_utils import parse_receipt_date


# Money pattern: ₹, rs., inr, $, or plain digits with decimals
MONEY_PATTERN = re.compile(
    r"(?:₹|rs\.?|inr|\$)?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)(?!%)",
    re.IGNORECASE,
)

TOTAL_LABELS = [
    r"grand\s*total",
    r"bill\s*total",
    r"amount\s*paid",
    r"net\s*amount",
    r"amount\s*payable",
    r"final\s*total",
    r"total\s*amount",
    r"total\s*inclusive\s*(?:of\s*)?gst",
    r"total\s*excluding\s*gst",
    r"total\s*(?:incl|excl)\s*gst",
    r"\btotal\b",
]

TAX_LABELS = [
    r"cgst",
    r"sgst",
    r"igst",
    r"total\s*gst",
    r"gst\s*amount",
    r"tax\s*amount",
    r"\btax\b",
    r"\bgst\b",
]

INVOICE_LABELS = [
    r"invoice\s*(?:no|num|number|#)?",
    r"bill\s*(?:no|num|number|#)?",
    r"receipt\s*(?:no|num|number|#)?",
    r"txn\s*(?:id|no|num)?",
]

PAYMENT_LABELS = [
    r"credit\s*card",
    r"debit\s*card",
    r"net\s*banking",
    r"upi",
    r"cash",
    r"visa",
    r"mastercard",
    r"amex",
    r"paytm",
    r"phonepe",
    r"gpay",
]


def extract_total(text: str) -> Optional[float]:
    """Extract final total amount from OCR text using deterministic regex."""
    if not text:
        return None

    lines = [line.strip() for line in text.splitlines() if line.strip()]

    # First search line by line matching known total label patterns
    for label_pat in TOTAL_LABELS:
        regex = re.compile(r"(?:" + label_pat + r")\s*[:\-\=]?\s*(.*)", re.IGNORECASE)
        for line in reversed(lines):  # Totals usually near the bottom
            match = regex.search(line)
            if match:
                val_match = MONEY_PATTERN.search(match.group(1) or line)
                if val_match:
                    val = normalize_currency_value(val_match.group(0))
                    if val is not None and val > 0:
                        return val

    # Fallback: find largest currency amount in text
    all_amounts = []
    for match in MONEY_PATTERN.finditer(text):
        val = normalize_currency_value(match.group(0))
        if val is not None and val > 0:
            all_amounts.append(val)

    if all_amounts:
        return max(all_amounts)

    return None


def extract_tax(text: str) -> Optional[float]:
    """Extract tax/GST amount from OCR text using deterministic regex."""
    if not text:
        return None

    lines = [line.strip() for line in text.splitlines() if line.strip()]

    for label_pat in TAX_LABELS:
        regex = re.compile(r"(?:" + label_pat + r")\s*[:\-\=]?\s*(.*)", re.IGNORECASE)
        for line in lines:
            match = regex.search(line)
            if match:
                val_match = MONEY_PATTERN.search(match.group(1) or line)
                if val_match:
                    val = normalize_currency_value(val_match.group(0))
                    if val is not None and val >= 0:
                        return val

    return None


def extract_date(text: str) -> Optional[str]:
    """Extract transaction date string from OCR text."""
    return parse_receipt_date(text)


def extract_currency(text: str) -> Optional[str]:
    """Detect currency symbol or code from OCR text."""
    if not text:
        return None

    if re.search(r"₹|rs\.?|inr", text, re.IGNORECASE):
        return "INR"
    if "$" in text or re.search(r"\busd\b", text, re.IGNORECASE):
        return "USD"
    if "€" in text or re.search(r"\beur\b", text, re.IGNORECASE):
        return "EUR"
    if "£" in text or re.search(r"\bgbp\b", text, re.IGNORECASE):
        return "GBP"

    return None


def extract_invoice_number(text: str) -> Optional[str]:
    """Extract invoice or receipt reference number."""
    if not text:
        return None

    for label_pat in INVOICE_LABELS:
        regex = re.compile(r"(?:" + label_pat + r")\s*[:\-\=#]?\s*([A-Z0-9\-_]+)", re.IGNORECASE)
        match = regex.search(text)
        if match:
            inv = match.group(1).strip()
            if len(inv) >= 3 and not inv.isalpha():
                return inv

    return None


def extract_payment_method(text: str) -> Optional[str]:
    """Extract payment method keyword."""
    if not text:
        return None

    for label_pat in PAYMENT_LABELS:
        regex = re.compile(r"\b(" + label_pat + r")\b", re.IGNORECASE)
        match = regex.search(text)
        if match:
            return match.group(1).upper()

    return None
