"""String manipulation and spacing normalization utilities."""

import re

# Known receipt keywords for space normalization
_RECEIPT_KEYWORDS = [
    "GRAND TOTAL", "BILL TOTAL", "AMOUNT PAID", "NET AMOUNT",
    "AMOUNT PAYABLE", "FINAL TOTAL", "TOTAL AMOUNT",
    "TOTAL INCLUSIVE GST", "TOTAL EXCLUDING GST", "TOTAL INCL GST",
    "TOTAL EXCL GST", "TOTAL GST",
    "SUB TOTAL", "SUBTOTAL", "TOTAL",
    "GST REG", "GST REG NO", "COMPANY NO",
    "CGST", "SGST", "IGST",
    "CREDIT CARD", "DEBIT CARD", "NET BANKING",
    "CASH", "CHANGE", "ITEMS",
    "THANK YOU", "PLEASE COME AGAIN", "INVOICE",
    "ORIGINAL RECEIPT", "RETURN POLICY",
]

_KW_PATTERN = re.compile(
    "|".join(re.escape(kw).replace(r"\ ", r"\s*") for kw in _RECEIPT_KEYWORDS),
    re.IGNORECASE,
)


def normalize_line_spacing(text: str) -> str:
    """Insert spaces into concatenated OCR text (e.g. 'TOTALINCLUSIVEGST:149.80' -> 'TOTAL INCLUSIVE GST: 149.80')."""
    if not text or not text.strip():
        return text or ""

    result = text

    # 1. Insert spaces around known receipt keywords
    def _kw_replace(m: re.Match) -> str:
        matched = m.group(0)
        for kw in _RECEIPT_KEYWORDS:
            if re.fullmatch(re.escape(kw).replace(r"\ ", r"\s*"), matched, re.IGNORECASE):
                return kw
        return matched

    result = _KW_PATTERN.sub(_kw_replace, result)

    # 2. camelCase / PascalCase boundaries: "MidValleyMegamall" -> "Mid Valley Megamall"
    result = re.sub(r"([a-z])([A-Z])", r"\1 \2", result)

    # 3. Letter <-> digit boundaries
    result = re.sub(r"([A-Za-z])(\d)", r"\1 \2", result)
    result = re.sub(r"(\d)([A-Za-z])", r"\1 \2", result)

    # 4. Colons/commas spacing
    result = re.sub(r":([^\s\d])", r": \1", result)
    result = re.sub(r",([^\s])", r", \1", result)

    # 5. Collapse spaces
    return re.sub(r"\s{2,}", " ", result).strip()


def clean_raw_text(text: str) -> str:
    """Normalize raw text for processing."""
    if not text:
        return ""
    return text.strip()
