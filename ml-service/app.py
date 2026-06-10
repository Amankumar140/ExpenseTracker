"""FastAPI server for the Expense Tracker OCR microservice.

Endpoints:
    POST /ocr     — Upload image, run OpenCV preprocessing -> PaddleOCR -> deterministic parser
    GET  /health  — Health check endpoint
"""

import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from ocr.paddle_service import log_runtime_diagnostics, get_paddle_service
from routes.ocr_routes import router as ocr_router

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Expense Tracker OCR API",
    description="Microservice for receipt image preprocessing, PaddleOCR extraction, and deterministic parsing.",
    version="2.0.0",
)


@app.on_event("startup")
async def startup_event():
    log_runtime_diagnostics()
    logger.info("Pre-warming PaddleOCR engine...")
    get_paddle_service()
    logger.info("PaddleOCR engine warm and ready.")


ALLOWED_ORIGINS = [
    "http://localhost:5000",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ocr_router)


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=False,
        log_level=settings.LOG_LEVEL.lower(),
    )
