"""
Prediction module for expense categorization.

Loads the pre-trained TF-IDF vectorizer and Naive Bayes model,
provides a predict_category() function for inference.
"""

import os
import joblib
import numpy as np

# ---------------------------------------------------------------------------
# Model loading (singleton — loaded once at import time)
# ---------------------------------------------------------------------------
_MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model")
_MODEL_PATH = os.path.join(_MODEL_DIR, "model.pkl")
_VECTORIZER_PATH = os.path.join(_MODEL_DIR, "vectorizer.pkl")

_model = None
_vectorizer = None
_model_loaded = False


def _load_model():
    """Load the model and vectorizer from disk."""
    global _model, _vectorizer, _model_loaded

    if _model_loaded:
        return

    if not os.path.exists(_MODEL_PATH) or not os.path.exists(_VECTORIZER_PATH):
        raise FileNotFoundError(
            f"Model files not found in {_MODEL_DIR}. "
            "Run 'python train.py' first to generate them."
        )

    _model = joblib.load(_MODEL_PATH)
    _vectorizer = joblib.load(_VECTORIZER_PATH)
    _model_loaded = True


def is_model_loaded() -> bool:
    """Check if the model is loaded and ready for predictions."""
    return _model_loaded


def get_categories() -> list[str]:
    """Return the list of categories the model can predict."""
    _load_model()
    return list(_model.classes_)


def predict_category(text: str) -> dict:
    """
    Predict the expense category from receipt text.
    
    Args:
        text: Raw receipt text (OCR output or manual input)
        
    Returns:
        dict with keys:
            - category (str): Predicted category name
            - confidence (float): Prediction confidence (0.0 - 1.0)
    """
    # Handle empty / whitespace-only input
    if not text or not text.strip():
        return {
            "category": "Other",
            "confidence": 0.30,
        }

    try:
        _load_model()

        # Preprocess
        cleaned = text.lower().strip()

        # Vectorize and predict
        text_tfidf = _vectorizer.transform([cleaned])
        predicted_category = _model.predict(text_tfidf)[0]

        # Get prediction probabilities
        probabilities = _model.predict_proba(text_tfidf)[0]
        max_confidence = float(np.max(probabilities))

        # Round confidence to 2 decimal places
        confidence = round(max_confidence, 2)

        return {
            "category": predicted_category,
            "confidence": confidence,
        }

    except Exception as e:
        print(f"Prediction error: {e}")
        return {
            "category": "Other",
            "confidence": 0.30,
        }


# Eagerly load model on import so first request is fast
try:
    _load_model()
except FileNotFoundError:
    print("WARNING: Model files not found. Run 'python train.py' to train the model.")
