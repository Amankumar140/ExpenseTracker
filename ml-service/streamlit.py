"""Streamlit Web Application for Expense Tracker ML Service.

Runs PaddleOCR, Regex Parsing, and AI Extraction natively inside Streamlit.
Run with: streamlit run streamlit.py
"""

import asyncio
import json
import os
import sys
import tempfile
from pathlib import Path

import streamlit as st
from PIL import Image

# Ensure ml-service root directory is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from pipeline.receipt_pipeline import ReceiptPipeline
from config.settings import settings

# Page Configuration
st.set_page_config(
    page_title="Expense Tracker ML & OCR Studio",
    page_icon="🧾",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Styling
st.markdown(
    """
    <style>
    .main-header {
        font-size: 2.3rem;
        font-weight: 700;
        background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1rem;
        color: #94a3b8;
        margin-bottom: 2rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# Header
st.markdown('<div class="main-header">🧾 Expense OCR & AI Categorizer Studio</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Standalone ML Service running PaddleOCR & AI Extraction directly on Streamlit</div>', unsafe_allow_html=True)

# Sidebar Configuration
st.sidebar.header("⚙️ OCR & AI Settings")

mistral_key = st.sidebar.text_input(
    "Mistral API Key",
    type="password",
    value=os.getenv("MISTRAL_API_KEY", settings.MISTRAL_API_KEY or ""),
    help="Optional: Enables LLM fallback for smart merchant & category extraction",
)

if mistral_key:
    settings.MISTRAL_API_KEY = mistral_key
    settings.LLM_ENABLED = True

use_llm = st.sidebar.checkbox(
    "Enable LLM Enrichment",
    value=bool(settings.MISTRAL_API_KEY and settings.LLM_ENABLED),
    help="Use Mistral AI to improve extraction accuracy when available",
)

st.sidebar.divider()
st.sidebar.markdown("### 📊 System Status")
st.sidebar.success("Engine: **Native PaddleOCR (In-Memory)**")
if use_llm and settings.MISTRAL_API_KEY:
    st.sidebar.success("LLM Status: **Mistral Connected**")
else:
    st.sidebar.info("LLM Status: **Regex Parsing Only**")

# Main Interface Layout
col_upload, col_result = st.columns([1, 1.2], gap="large")

with col_upload:
    st.subheader("📤 Upload Receipt Image")
    uploaded_file = st.file_uploader(
        "Choose a receipt image file (JPG, PNG, WEBP)",
        type=["jpg", "jpeg", "png", "webp", "bmp"],
    )

    if uploaded_file is not None:
        image = Image.open(uploaded_file)
        st.image(image, caption="Uploaded Receipt Preview")

        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(uploaded_file.name).suffix) as tmp_file:
            tmp_file.write(uploaded_file.getbuffer())
            tmp_image_path = tmp_file.name

with col_result:
    st.subheader("🔍 Extraction & AI Results")

    if uploaded_file is not None and st.button("🚀 Process Receipt", type="primary"):
        pipeline = ReceiptPipeline()

        with st.spinner("Running PaddleOCR & AI Extraction natively..."):
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                res_obj = loop.run_until_complete(pipeline.process_image_full(tmp_image_path))
                loop.close()
                result_data = res_obj.model_dump()

                # Clean up temp file
                if 'tmp_image_path' in locals() and os.path.exists(tmp_image_path):
                    os.remove(tmp_image_path)

                if result_data:
                    parsed_fields = result_data.get("parsed_fields", {})
                    currency = parsed_fields.get("currency") or "$"
                    total = parsed_fields.get("total") or "0.00"

                    m1, m2, m3 = st.columns(3)
                    with m1:
                        st.metric("Total Amount", f"{currency}{total}")
                    with m2:
                        st.metric("Merchant", result_data.get("merchant") or "Unknown")
                    with m3:
                        st.metric("Category", result_data.get("category") or "Uncategorized")

                    m4, m5, m6 = st.columns(3)
                    with m4:
                        st.metric("Receipt Date", parsed_fields.get("date") or "N/A")
                    with m5:
                        st.metric("Payment Method", parsed_fields.get("payment_method") or "N/A")
                    with m6:
                        conf = result_data.get("ocr_confidence", 0) * 100
                        st.metric("OCR Confidence", f"{conf:.1f}%")

                    st.divider()

                    proc_time = result_data.get("processing_time")
                    if proc_time:
                        st.markdown(
                            f"⏱️ **Processing Speed**: Total `{proc_time.get('total_ms', 0):.0f}ms` | OCR `{proc_time.get('ocr_ms', 0):.0f}ms` | Regex `{proc_time.get('regex_ms', 0):.0f}ms` | LLM `{proc_time.get('llm_ms', 0):.0f}ms`"
                        )

                    tab_text, tab_json, tab_lines = st.tabs(["📝 Extracted Text", "📦 Raw JSON Response", "📐 Line Details"])

                    with tab_text:
                        st.text_area("Normalized OCR Text", value=result_data.get("extracted_text", ""), height=250)

                    with tab_json:
                        st.json(result_data)
                        st.download_button(
                            label="📥 Download Extraction JSON",
                            data=json.dumps(result_data, indent=2),
                            file_name=f"ocr_result_{Path(uploaded_file.name).stem}.json",
                            mime="application/json",
                        )

                    with tab_lines:
                        lines = result_data.get("ocr_data", {}).get("lines", [])
                        if lines:
                            st.dataframe(
                                [{"Text": l.get("text", ""), "Confidence": f"{l.get('confidence', 0)*100:.1f}%"} for l in lines]
                            )

                    warnings = result_data.get("warnings", [])
                    if warnings:
                        for w in warnings:
                            st.warning(w)

            except Exception as e:
                st.error(f"Error processing receipt: {str(e)}")
                if 'tmp_image_path' in locals() and os.path.exists(tmp_image_path):
                    os.remove(tmp_image_path)
    elif uploaded_file is None:
        st.info("Upload a receipt on the left panel and click **Process Receipt** to run OCR.")
