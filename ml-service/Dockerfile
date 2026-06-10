# ============================================================
# Expense Categorization ML Microservice v2.0
# ============================================================
# Build:  docker build -t expense-ml-service .
# Run:    docker run -p 8000:8000 expense-ml-service
# ============================================================

FROM python:3.11-slim AS base

WORKDIR /app

# Install system dependencies (OpenCV and PaddleOCR CPU inference)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY text_utils.py preprocessing.py dataset_loader.py train.py predict.py app.py ./
COPY ocr/ ./ocr/

# Copy data for training
COPY data/ ./data/

# Train model during build so the image ships with pre-trained artifacts
RUN python train.py

# Create logs directory
RUN mkdir -p logs

# Create non-root user for security
RUN adduser --disabled-password --gecos "" appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]



