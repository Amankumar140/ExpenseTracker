"""Currency parsing and normalization helpers."""

import re
from typing import Optional


def normalize_currency_value(raw: str | float | int | None) -> Optional[float]:
    """Parse raw money string into a float value."""
    if raw is None:
        return None
    if isinstance(raw, (int, float)):
        return float(raw) if raw >= 0 else None

    cleaned = re.sub(r"(?:₹|rs\.?|inr|\$|\s|,)", "", str(raw), flags=re.IGNORECASE)
    if not re.match(r"^\d+(?:\.\d{1,2})?$", cleaned):
        return None

    try:
        val = float(cleaned)
        return val if val >= 0 else None
    except ValueError:
        return None
