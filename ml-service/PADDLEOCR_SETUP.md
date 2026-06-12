# PaddleOCR setup

The ML service now uses PaddleOCR PP-OCRv5 on CPU. From `ml-service/`, install
the CPU packages into the service virtual environment:

```powershell
.\venv\Scripts\python.exe -m pip uninstall -y easyocr torch torchvision
.\venv\Scripts\python.exe -m pip install --upgrade pip
.\venv\Scripts\python.exe -m pip install paddlepaddle paddleocr
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

The first request downloads/initializes the PP-OCRv5 models; subsequent
requests reuse the process singleton. Use `uvicorn app:app --host 0.0.0.0 --port 8000`
as before. No CUDA package is required.
