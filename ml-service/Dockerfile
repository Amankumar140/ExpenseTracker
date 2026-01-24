# ============================================================
# Expense Categorization ML Microservice
# ============================================================
# Build:  docker build -t expense-ml-service .
# Run:    docker run -p 8000:8000 expense-ml-service
# ============================================================

FROM python:3.11-slim AS base

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY train.py predict.py app.py ./

# Train model during build so the image ships with pre-trained artifacts
RUN python train.py

# Create non-root user for security
RUN adduser --disabled-password --gecos "" appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
