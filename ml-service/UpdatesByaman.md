# 🚀 ExpenseTracker ML Pipeline Updates

This document summarizes the changes, upgrades, and additions made to the **ML Service** to transform it from a synthetic-data proof-of-concept into a production-ready categorization pipeline.

## 📂 Files Updated & Created
**Modified Files:**
- `app.py` (Added new endpoints & prediction logging)
- `predict.py` (Added image prediction, confidence thresholding, and logging)
- `train.py` (Swapped model to LogisticRegression, added stratified splits and full evaluation)
- `requirements.txt` (Added OpenCV, PyTesseract, and strict versions)
- `Dockerfile` (Added system-level installs for Tesseract & libgl for OpenCV)

**New Files Created:**
- `preprocessing.py` (OpenCV image enhancements before OCR)
- `dataset_loader.py` (Heuristic classification, class balancing, dataset importing)
- `text_utils.py` (Standardized regex text cleaning and duplicate hashing)
- `test_pipeline.py` (Extensive testing suite for validations)


## 1. 🖼️ OpenCV Image Preprocessing (`preprocessing.py`)
- Created a dedicated image preprocessing pipeline to improve OCR accuracy. 
- Features implemented prior to OCR extraction:
  - Conversion to grayscale and rescaling/upscaling.
  - Gaussian blur filter to reduce noise.
  - Adaptive thresholding for handling poor/uneven receipt lighting.
  - Morphological operations (dilation/erosion) to connect broken characters.
  - Algorithmic deskewing to automatically rotate tilted receipts.

## 2. 🗄️ Real-World Dataset Integration (`dataset_loader.py`)
- Integrated the **SROIE 2019** real-world OCR dataset into the dataset pipeline alongside existing synthetic JSON datasets.
- Created keyword heuristics to categorize unsupervised SROIE text lines into the 10 specific categories.
- Added **stratified dataset loaders**: ensures equal distribution of data.
- Added **Duplicate handling** (via md5 text hashing) filtering out repeat records in test bounds.
- Added Class balancing (oversampling/undersampling logic) to correct the severe distribution imbalances.

## 3. 🧠 Model Upgrade & Training (`train.py`)
- **Model Replaced:** Upgraded from simple `MultinomialNB` (Naive Bayes) to a robust `LogisticRegression` pipeline.
- Implemented comprehensive train-test stratified splitting to ensure evaluation is legitimate.
- Added full evaluation metrics automatically printed on train (Accuracy percentage, F1-Score, Classification Reports, and Confusion Matrices). 
- Tested latest model tracking an accuracy of **89.58%**.

## 4. 🎛️ Inference Fallbacks & Low-Confidence (`predict.py`)
- Added a **Confidence Thresholding** (calibrated to `0.4`):
  - Any inference output measuring below `0.4` confidence is automatically mapped to `"Other"`. 
- **Uncertainty Logging:** `predict.py` explicitly tracks and logs every inference failing the threshold strictly to `/logs/uncertain_predictions.jsonl` for manual review.
- Added support for end-to-end `predict_from_image()` inference directly natively taking an image path, extracting OCR text automatically, and classifying it. 

## 5. 🌐 FastAPI Microservice Improvements (`app.py`)
- **New Image Upload Endpoint:** Extracted multipart file upload logic mapping dynamically to `POST /predict-from-image`.
- **Active Feedback Loop API:** Implemented a new internal `POST /feedback` endpoint to capture humans correcting the system's incorrect guesses and routing them back to the `/logs/feedback.jsonl` for a future re-training cycle.
- Enforced complete prediction logging across endpoints. 

## 6. 🛠️ Utilities & Testing (`text_utils.py` & `test_pipeline.py`)
- **Text Cleanups:** Normalized string cleaning logic explicitly `clean_text()` centralizing punctuation strips, Unicode character normalizations (fixing accents like `é`), and lowercase casts preventing feature mismatch between train time and application time.
- **Robust Pipeline Test Suite:** Mapped an entirely structured python testing suite checking dataset integrity, text utility accuracy, fallback safety, and OpenCV pipeline functionality ensuring stable deploys in the future. 
- Pinned and isolated reliable pip packages (e.g., `opencv-python>=4.10.0`, `pytesseract`) in `requirements.txt`.
