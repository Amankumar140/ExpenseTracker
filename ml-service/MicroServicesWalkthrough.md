# ML Microservice — Walkthrough

## What Was Built

A production-ready Python microservice at `ml-service/` that predicts expense categories from receipt OCR text using machine learning.

### Files Created

| File | Purpose |
|------|---------|
| [requirements.txt](file:///c:/Users/amank/OneDrive/Desktop/Programs/ExpenseTracker/ml-service/requirements.txt) | Pinned dependencies (FastAPI, scikit-learn, etc.) |
| [train.py](file:///c:/Users/amank/OneDrive/Desktop/Programs/ExpenseTracker/ml-service/train.py) | Generates 600 synthetic receipt samples, trains TF-IDF + Naive Bayes |
| [predict.py](file:///c:/Users/amank/OneDrive/Desktop/Programs/ExpenseTracker/ml-service/predict.py) | Singleton model loader with [predict_category()](file:///c:/Users/amank/OneDrive/Desktop/Programs/ExpenseTracker/ml-service/predict.py#53-100) |
| [app.py](file:///c:/Users/amank/OneDrive/Desktop/Programs/ExpenseTracker/ml-service/app.py) | FastAPI server with 3 endpoints + CORS |
| [Dockerfile](file:///c:/Users/amank/OneDrive/Desktop/Programs/ExpenseTracker/ml-service/Dockerfile) | Docker image with model trained at build time |
| [.gitignore](file:///c:/Users/amank/OneDrive/Desktop/Programs/ExpenseTracker/ml-service/.gitignore) | Ignores venv, pycache, model pickles |

---

## Verification Results

### Model Training ✅

- **12 categories** aligned with existing [categorizationService.js](file:///c:/Users/amank/OneDrive/Desktop/Programs/ExpenseTracker/backend/services/categorizationService.js)
- **3,464 TF-IDF features** (unigram + bigram)
- Model artifacts saved to `model/model.pkl` and `model/vectorizer.pkl`

### API Endpoint Tests ✅

**POST /predict-category** — All predictions correct:

| Input Text | Category | Confidence |
|-----------|----------|------------|
| "Starbucks coffee latte total $5.75" | Food & Dining | 0.65 |
| "Walmart grocery store milk bread eggs organic produce total $87.50" | Groceries | 0.94 |
| "Uber ride trip downtown airport fare total $25.40" | Transportation | 0.71 |

**GET /health** — Returns `{ "status": "healthy", "model_loaded": true }`

**GET /categories** — Returns all 12 categories with count

---

## How to Run

```bash
cd ml-service
python -m venv venv
.\venv\Scripts\pip.exe install -r requirements.txt   # Windows
python train.py    # Train model (generates model/*.pkl)
python app.py      # Start server on port 8000
```

### Docker

```bash
docker build -t expense-ml-service .
docker run -p 8000:8000 expense-ml-service
```
