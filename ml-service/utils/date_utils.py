"""Date parsing and normalization helpers."""

import re
from datetime import datetime
from typing import Optional


def parse_receipt_date(raw_text: str) -> Optional[str]:
    """Extract and normalize transaction date string from OCR text."""
    if not raw_text:
        return None

    # Patterns for YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, DD MMM YYYY, etc.
    patterns = [
        r"\b(\d{4}[-/\.]\d{1,2}[-/\.]\d{1,2})\b",
        r"\b(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})\b",
        r"\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b",
    ]

    for pat in patterns:
        match = re.search(pat, raw_text, re.IGNORECASE)
        if match:
            date_str = match.group(1)
            # Normalize common delimiters
            cleaned_date = date_str.replace("/", "-").replace(".", "-")
            return cleaned_date

    return None
