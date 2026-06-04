"""Adapter that converts PaddleOCR output into the application's OCR contract."""

from __future__ import annotations

import logging
import re
from pathlib import Path
from typing import Any

import cv2
import numpy as np

from preprocessing import preprocess_image
from .paddle_service import get_paddle_service

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Space normalization for PaddleOCR v3 concatenated text
# ---------------------------------------------------------------------------
# Known receipt keywords that PaddleOCR concatenates (order: longest first)
_RECEIPT_KEYWORDS = [
    # Totals / amounts
    "GRAND TOTAL", "BILL TOTAL", "AMOUNT PAID", "NET AMOUNT",
    "AMOUNT PAYABLE", "FINAL TOTAL", "TOTAL AMOUNT",
    "TOTAL INCLUSIVE GST", "TOTAL EXCLUDING GST", "TOTAL INCL GST",
    "TOTAL EXCL GST", "TOTAL GST",
    "SUB TOTAL", "SUBTOTAL", "TOTAL",
    # Tax
    "GST REG", "GST REG NO", "COMPANY NO",
    "CGST", "SGST", "IGST",
    # Payment
    "CREDIT CARD", "DEBIT CARD", "NET BANKING",
    "CASH", "CHANGE", "ITEMS",
    # Misc receipt fields
    "THANK YOU", "PLEASE COME AGAIN", "INVOICE",
    "ORIGINAL RECEIPT", "RETURN POLICY",
    "MID VALLEY", "KUALA LUMPUR",
]

# Pre-compile pattern: build alternation from keywords (escaped, case-insensitive)
_KW_PATTERN = re.compile(
    "|".join(re.escape(kw).replace(r"\ ", r"\s*") for kw in _RECEIPT_KEYWORDS),
    re.IGNORECASE,
)


def normalize_line_spacing(text: str) -> str:
    """Insert spaces into concatenated PaddleOCR text.

    PaddleOCR v3 often outputs ``"TOTALINCLUSIVEGST:149.80"`` instead of
    ``"TOTAL INCLUSIVE GST: 149.80"``.  This function fixes that using:
      1. Known keyword dictionary replacement
      2. camelCase / PascalCase boundary splitting
      3. Letter↔digit transition splitting
      4. Colon/comma spacing
    """
    if not text or not text.strip():
        return text

    result = text

    # 1. Insert spaces around known receipt keywords
    def _kw_replace(m: re.Match) -> str:
        matched = m.group(0)
        # Find which keyword matched and return the spaced version
        for kw in _RECEIPT_KEYWORDS:
            if re.fullmatch(re.escape(kw).replace(r"\ ", r"\s*"), matched, re.IGNORECASE):
                return kw
        return matched

    result = _KW_PATTERN.sub(_kw_replace, result)

    # 2. camelCase / PascalCase boundaries: "MidValleyMegamall" → "Mid Valley Megamall"
    #    Insert space before an uppercase letter that follows a lowercase letter
    result = re.sub(r"([a-z])([A-Z])", r"\1 \2", result)

    # 3. Sequences of uppercase words: "WOMENSDRYEX" → keep as is (no reliable boundary)
    #    But: "SDN.BHD." leave alone, "TEL:" → "TEL:"
    #    Split ALLCAPS runs only at transitions like "GSTReg" (already handled above)

    # 4. Letter↔digit boundaries (but preserve patterns like "X00016" or "$5.75")
    #    "1X74.90" should stay, but "ITEMS:2" → "ITEMS: 2"
    result = re.sub(r"([A-Za-z])(\d)", r"\1 \2", result)
    result = re.sub(r"(\d)([A-Za-z])", r"\1 \2", result)

    # 5. Ensure space after colons/commas if followed by a non-space character
    result = re.sub(r":([^\s\d])", r": \1", result)
    result = re.sub(r",([^\s])", r", \1", result)

    # 6. Collapse multiple spaces
    result = re.sub(r"\s{2,}", " ", result).strip()

    return result


def ensure_bgr_uint8(image: np.ndarray) -> np.ndarray:
    """Normalize only valid grayscale/BGR/BGRA arrays to PaddleOCR's BGR input."""
    if not isinstance(image, np.ndarray):
        raise TypeError(f"PaddleOCR input must be a NumPy array, got {type(image).__name__}")
    if image.size == 0:
        raise ValueError("PaddleOCR input image is empty")
    if image.dtype != np.uint8:
        if not np.issubdtype(image.dtype, np.number):
            raise TypeError(f"Unsupported PaddleOCR image dtype: {image.dtype}")
        image = np.clip(image, 0, 255).astype(np.uint8)
    if image.ndim == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
    elif image.ndim == 3 and image.shape[2] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_BGRA2BGR)
    elif image.ndim != 3 or image.shape[2] != 3:
        raise ValueError(
            "Unsupported OCR image format. Expected grayscale (H, W), BGR (H, W, 3), "
            f"or BGRA (H, W, 4); received shape {image.shape}."
        )
    if image.ndim != 3 or image.shape[2] != 3 or image.dtype != np.uint8:
        raise ValueError(f"Invalid PaddleOCR input after normalization: shape={image.shape}, dtype={image.dtype}")
    return np.ascontiguousarray(image)


def extract_receipt(image_path: str | Path) -> dict[str, Any]:
    """Preprocess and OCR one receipt, returning text plus spatial layout."""
    image = preprocess_image(str(image_path))
    logger.debug("Shape after preprocessing: %s (dtype=%s)", image.shape, image.dtype)
    image = ensure_bgr_uint8(image)
    logger.debug("Shape immediately before PaddleOCR inference: %s (dtype=%s)", image.shape, image.dtype)
    pages = get_paddle_service().recognize(image)

    # Normalize spacing in each line's text
    for page in pages:
        for line in page.get("lines", []):
            line["text"] = normalize_line_spacing(line.get("text", ""))

    lines = [line for page in pages for line in page["lines"]]
    confidence = float(np.mean([line["confidence"] for line in lines])) if lines else 0.0
    return {
        "extracted_text": "\n".join(line["text"] for line in lines),
        "ocr_confidence": confidence,
        "ocr_data": {"pages": pages, "lines": lines},
    }
