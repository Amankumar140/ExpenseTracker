"""Image format validation and numpy array normalization helpers."""

import cv2
import numpy as np


def ensure_bgr_uint8(image: np.ndarray) -> np.ndarray:
    """Normalize grayscale/BGR/BGRA arrays to PaddleOCR's contiguous BGR uint8 input."""
    if not isinstance(image, np.ndarray):
        raise TypeError(f"Image input must be a NumPy array, got {type(image).__name__}")
    if image.size == 0:
        raise ValueError("Image input array is empty")
    if image.dtype != np.uint8:
        if not np.issubdtype(image.dtype, np.number):
            raise TypeError(f"Unsupported image dtype: {image.dtype}")
        image = np.clip(image, 0, 255).astype(np.uint8)

    if image.ndim == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
    elif image.ndim == 3 and image.shape[2] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_BGRA2BGR)
    elif image.ndim != 3 or image.shape[2] != 3:
        raise ValueError(f"Unsupported image format with shape {image.shape}")

    return np.ascontiguousarray(image)
