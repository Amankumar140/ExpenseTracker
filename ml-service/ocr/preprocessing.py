"""OpenCV-based image preprocessing pipeline for receipt OCR."""

import os
import logging
import numpy as np

try:
    import cv2
except ImportError:
    cv2 = None
    logging.warning("OpenCV not installed. Image preprocessing will be unavailable.")

from config.settings import settings

logger = logging.getLogger(__name__)


def preprocess_image(image_path: str) -> np.ndarray:
    """Full image preprocessing pipeline optimized for receipt OCR."""
    if cv2 is None:
        raise RuntimeError("OpenCV (cv2) is required for image preprocessing.")

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    image = cv2.imread(image_path)
    if image is None:
        raise RuntimeError(f"OpenCV failed to read image: {image_path}")

    # 1. Grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # 2. Adaptive threshold for skew detection
    thresh = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        settings.ADAPTIVE_BLOCK_SIZE,
        settings.ADAPTIVE_C,
    )

    # 3. Deskew
    angle = _detect_skew_angle(thresh)
    deskewed = _rotate_image(image, angle)

    # 4. Resize
    resized = _optimize_resolution_for_ocr(deskewed)
    return resized


def _detect_skew_angle(binary_image: np.ndarray) -> float:
    coords = np.column_stack(np.where(binary_image > 0))
    if len(coords) < 50:
        return 0.0
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    return angle


def _rotate_image(image: np.ndarray, angle: float) -> np.ndarray:
    if abs(angle) < 0.5 or abs(angle) > 15:
        return image
    h, w = image.shape[:2]
    center = (w // 2, h // 2)
    rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    return cv2.warpAffine(
        image,
        rotation_matrix,
        (w, h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE,
    )


def _optimize_resolution_for_ocr(image: np.ndarray) -> np.ndarray:
    h, w = image.shape[:2]
    max_side = max(h, w)

    if max_side > settings.MAX_SIDE_FOR_OCR:
        scale = settings.MAX_SIDE_FOR_OCR / max_side
        new_w = max(1, int(w * scale))
        new_h = max(1, int(h * scale))
        return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)

    if w < settings.MIN_WIDTH_FOR_OCR:
        scale = settings.MIN_WIDTH_FOR_OCR / w
        new_w = max(1, int(w * scale))
        new_h = max(1, int(h * scale))
        return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_CUBIC)

    return image
