"""CPU-only singleton PaddleOCR service for raw OCR extraction."""

from __future__ import annotations

import os
import sys
import logging
import platform
from importlib import metadata
from typing import Any

import numpy as np

# Configure CPU environment flags before importing paddle / paddleocr
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["FLAGS_enable_pir_api"] = "0"
os.environ["FLAGS_enable_pir_in_executor"] = "0"
os.environ["PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK"] = "True"

try:
    import torch  # noqa: F401
except ImportError:
    pass

import paddle
from paddleocr import PaddleOCR

from config.settings import settings
from utils.image_utils import ensure_bgr_uint8

logger = logging.getLogger(__name__)


def _package_version(name: str) -> str:
    try:
        return metadata.version(name)
    except metadata.PackageNotFoundError:
        return "unknown"


PADDLEOCR_VERSION = _package_version("paddleocr")
PADDLE_VERSION = getattr(paddle, "__version__", _package_version("paddlepaddle"))


def runtime_details() -> dict[str, str]:
    return {
        "paddleocr": PADDLEOCR_VERSION,
        "paddlepaddle": PADDLE_VERSION,
        "python": sys.version.split()[0],
        "platform": platform.platform(),
        "FLAGS_use_mkldnn": os.environ.get("FLAGS_use_mkldnn", "unset"),
        "FLAGS_enable_pir_api": os.environ.get("FLAGS_enable_pir_api", "unset"),
        "FLAGS_enable_pir_in_executor": os.environ.get("FLAGS_enable_pir_in_executor", "unset"),
    }


def log_runtime_diagnostics() -> None:
    logger.info("Paddle OCR runtime: %s", runtime_details())


def _configure_cpu_runtime() -> None:
    flags = {
        "FLAGS_use_mkldnn": False,
        "FLAGS_enable_pir_api": False,
        "FLAGS_enable_pir_in_executor": False,
    }
    try:
        paddle.set_flags(flags)
    except Exception:
        pass
    try:
        import paddle.base.core as core
        core.set_flags(flags)
    except Exception:
        pass


class PaddleReceiptOCR:
    """Owns one PaddleOCR CPU engine instance for the process lifetime."""

    def __init__(self) -> None:
        _configure_cpu_runtime()
        logger.info("Loading PaddleOCR engine on CPU...")
        try:
            self._engine = PaddleOCR(
                lang=settings.PADDLE_LANG,
                use_doc_orientation_classify=False,
                use_doc_unwarping=False,
                use_textline_orientation=False,
                enable_mkldnn=False,
            )
            _configure_cpu_runtime()
        except Exception as exc:
            logger.exception("PaddleOCR initialization failed: %s", runtime_details())
            raise RuntimeError(f"PaddleOCR initialization failed: {runtime_details()}") from exc

    def recognize(self, image: np.ndarray) -> list[dict[str, Any]]:
        """Run PaddleOCR inference and return structured line records."""
        image_bgr = ensure_bgr_uint8(image)
        try:
            results = self._engine.ocr(image_bgr)
            pages: list[dict[str, Any]] = []
            lines = []

            if results and isinstance(results, list) and len(results) > 0 and results[0] is not None:
                res0 = results[0]

                # PaddleOCR v3 (PaddleX OCRResult or dict with rec_texts, rec_scores, dt_polys)
                if isinstance(res0, dict) or hasattr(res0, "get"):
                    rec_texts = res0.get("rec_texts", res0.get("rec_text", [])) or []
                    rec_scores = res0.get("rec_scores", res0.get("rec_score", [])) or []
                    dt_polys = res0.get("dt_polys", res0.get("rec_polys", res0.get("rec_boxes", []))) or []

                    for i, text in enumerate(rec_texts):
                        if not text or not str(text).strip():
                            continue
                        score = rec_scores[i] if i < len(rec_scores) else 1.0
                        box = dt_polys[i] if i < len(dt_polys) else []
                        try:
                            if len(box) > 0:
                                points = np.asarray(box).reshape(-1, 2).tolist()
                                xs = [float(point[0]) for point in points]
                                ys = [float(point[1]) for point in points]
                                bbox = {
                                    "x": min(xs),
                                    "y": min(ys),
                                    "width": max(xs) - min(xs),
                                    "height": max(ys) - min(ys),
                                }
                            else:
                                points = []
                                bbox = {"x": 0.0, "y": 0.0, "width": 0.0, "height": 0.0}

                            lines.append({
                                "text": str(text).strip(),
                                "confidence": float(score) if score is not None else 1.0,
                                "bbox": bbox,
                                "polygon": points,
                                "page": 1,
                            })
                        except Exception as parse_err:
                            logger.warning("Skipping OCR item due to format error: %s", parse_err)
                            continue

                # PaddleOCR v2 (list of [box, (text, score)] items)
                elif isinstance(res0, (list, tuple)):
                    for item in res0:
                        if not item or not isinstance(item, (list, tuple)) or len(item) < 2:
                            continue
                        box = item[0]
                        rec_val = item[1]

                        text, score = "", 1.0
                        if isinstance(rec_val, (list, tuple)):
                            if len(rec_val) >= 2:
                                text, score = rec_val[0], rec_val[1]
                            elif len(rec_val) == 1:
                                text = rec_val[0]
                        elif isinstance(rec_val, str):
                            text = rec_val
                        elif isinstance(rec_val, dict):
                            text = rec_val.get("text", "")
                            score = rec_val.get("score", rec_val.get("confidence", 1.0))

                        if not text or not str(text).strip():
                            continue

                        try:
                            points = np.asarray(box).reshape(-1, 2).tolist()
                            xs = [float(point[0]) for point in points]
                            ys = [float(point[1]) for point in points]
                            lines.append({
                                "text": str(text).strip(),
                                "confidence": float(score) if score is not None else 1.0,
                                "bbox": {
                                    "x": min(xs),
                                    "y": min(ys),
                                    "width": max(xs) - min(xs),
                                    "height": max(ys) - min(ys),
                                },
                                "polygon": points,
                                "page": 1,
                            })
                        except Exception as parse_err:
                            logger.warning("Skipping OCR item due to format error: %s", parse_err)
                            continue

            pages.append({"number": 1, "lines": lines})
            return pages
        except Exception as exc:
            logger.exception("PaddleOCR inference failed.")
            raise RuntimeError(f"PaddleOCR inference failed: {exc}") from exc


_instance: PaddleReceiptOCR | None = None


def get_paddle_service() -> PaddleReceiptOCR:
    global _instance
    if _instance is None:
        _instance = PaddleReceiptOCR()
    return _instance
