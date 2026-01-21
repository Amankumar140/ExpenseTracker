"""
FastAPI server for the NLP-based expense categorization microservice.

Endpoints:
    POST /predict-category  — Predict expense category from receipt text
    GET  /health            — Health check
    GET  /categories        — List supported categories

Usage:
    python app.py
    # or
    uvicorn app:app --host 0.0.0.0 --port 8000
"""

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from predict import predict_category, get_categories, is_model_loaded

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Expense Categorization API",
    description="NLP-based expense category prediction from receipt OCR text",
    version="1.0.0",
)

# CORS — allow requests from the Node.js backend and any frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------
class PredictRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        description="Receipt OCR text to categorize",
        json_schema_extra={"example": "Starbucks coffee latte total $5.75"},
    )


class PredictResponse(BaseModel):
    category: str = Field(description="Predicted expense category")
    confidence: float = Field(description="Prediction confidence (0.0 - 1.0)")


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


class CategoriesResponse(BaseModel):
    categories: list[str]
    count: int


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.post(
    "/predict-category",
    response_model=PredictResponse,
    summary="Predict expense category",
    description="Accepts receipt OCR text and returns the predicted category with confidence score.",
)
async def predict_endpoint(request: PredictRequest):
    """Predict the expense category from receipt text."""
    if not is_model_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Run 'python train.py' first.",
        )

    result = predict_category(request.text)
    return PredictResponse(**result)


@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
)
async def health_check():
    """Check if the service is running and model is loaded."""
    return HealthResponse(
        status="healthy" if is_model_loaded() else "degraded",
        model_loaded=is_model_loaded(),
    )


@app.get(
    "/categories",
    response_model=CategoriesResponse,
    summary="List categories",
)
async def list_categories():
    """Return all supported expense categories."""
    if not is_model_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Run 'python train.py' first.",
        )

    cats = get_categories()
    return CategoriesResponse(categories=cats, count=len(cats))


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info",
    )
