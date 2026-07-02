"""Streamlit Web Application for Expense Tracker ML Service.

Provides an interactive GUI for receipt OCR, regex parsing, and LLM category extraction.
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
    .metric-card {
        background-color: #1e293b;
        border-radius: 12px;
        padding: 1.2rem;
        border: 1px solid #334155;
        text-align: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .metric-value {
        font-size: 1.6rem;
        font-weight: 700;
        color: #38bdf8;
    }
    .metric-label {
        font-size: 0.85rem;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# Header
st.markdown('<div class="main-header">🧾 Expense OCR & AI Categorizer Studio</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Powered by PaddleOCR engine, Regex Parsing, and Mistral LLM fallback</div>', unsafe_allow_html=True)

# Sidebar Configuration
st.sidebar.header("⚙️ Microservice Settings")

api_key_input = st.sidebar.text_input(
    "Mistral API Key",
    type="password",
    value=os.getenv("MISTRAL_API_KEY", settings.MISTRAL_API_KEY or ""),
    help="Optional: Enables LLM fallback for smart merchant & category extraction",
)

if api_key_input:
    settings.MISTRAL_API_KEY = api_key_input
    settings.LLM_ENABLED = True

use_llm = st.sidebar.checkbox(
    "Enable LLM Enrichment",
    value=bool(settings.MISTRAL_API_KEY and settings.LLM_ENABLED),
    help="Use Mistral AI to improve extraction accuracy when available",
)

st.sidebar.divider()
st.sidebar.markdown("### 📊 System Status")
st.sidebar.success("PaddleOCR Engine: **Active**")
if use_llm and settings.MISTRAL_API_KEY:
    st.sidebar.success("Mistral LLM Service: **Connected**")
else:
    st.sidebar.info("LLM Service: **Regex Only Mode**")

# Main Interface Layout
col_upload, col_result = st.columns([1, 1.2], gap="large")

with col_upload:
    st.subheader("📤 Upload Receipt Image")
    uploaded_file = st.file_uploader(
        "Choose a receipt image file (JPG, PNG, WEBP)",
        type=["jpg", "jpeg", "png", "webp", "bmp"],
    )

    if uploaded_file is not None:
        # Display image preview
        image = Image.open(uploaded_file)
        st.image(image, caption="Uploaded Receipt Preview", use_container_width=True)

        # Save to temporary file for pipeline processing
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(uploaded_file.name).suffix) as tmp_file:
            tmp_file.write(uploaded_file.getbuffer())
            tmp_image_path = tmp_file.name

with col_result:
    st.subheader("🔍 Extraction & AI Results")

    if uploaded_file is not None and st.button("🚀 Process Receipt", type="primary", use_container_width=True):
        pipeline = ReceiptPipeline()

        with st.spinner("Running PaddleOCR & AI Processing Pipeline..."):
            try:
                # Run full processing pipeline asynchronously
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                result = loop.run_until_complete(pipeline.process_image_full(tmp_image_path))
                loop.close()

                # Clean up temp file
                if os.path.exists(tmp_image_path):
                    os.remove(tmp_image_path)

                # Display High-Level Metric Cards
                fields = result.parsed_fields

                m1, m2, m3 = st.columns(3)
                with m1:
                    st.metric("Total Amount", f"{fields.currency or '$'}{fields.total or '0.00'}")
                with m2:
                    st.metric("Merchant", result.merchant or "Unknown")
                with m3:
                    st.metric("Category", result.category or "Uncategorized")

                m4, m5, m6 = st.columns(3)
                with m4:
                    st.metric("Receipt Date", fields.date or "N/A")
                with m5:
                    st.metric("Payment Method", fields.payment_method or "N/A")
                with m6:
                    st.metric("OCR Confidence", f"{result.ocr_confidence * 100:.1f}%")

                st.divider()

                # Performance Timing Breakdown
                if result.processing_time:
                    t = result.processing_time
                    st.markdown(
                        f"⏱️ **Processing Speed**: Total `{t.total_ms:.0f}ms` | OCR `{t.ocr_ms:.0f}ms` | Regex `{t.regex_ms:.0f}ms` | LLM `{t.llm_ms:.0f}ms`"
                    )

                # Tabs for Detailed Breakdown
                tab_text, tab_json, tab_lines = st.tabs(["📝 Extracted Text", "📦 Raw JSON Response", "📐 Line Details"])

                with tab_text:
                    st.text_area("Normalized OCR Text", value=result.extracted_text, height=250)

                with tab_json:
                    json_data = result.model_dump()
                    st.json(json_data)
                    st.download_button(
                        label="📥 Download Extraction JSON",
                        data=json.dumps(json_data, indent=2),
                        file_name=f"ocr_result_{Path(uploaded_file.name).stem}.json",
                        mime="application/json",
                    )

                with tab_lines:
                    lines = result.ocr_data.get("lines", [])
                    if lines:
                        st.dataframe(
                            [{"Text": l["text"], "Confidence": f"{l['confidence']*100:.1f}%"} for l in lines],
                            use_container_width=True,
                        )

                if result.warnings:
                    for warning in result.warnings:
                        st.warning(warning)

            except Exception as e:
                st.error(f"Error processing receipt: {str(e)}")
                if os.path.exists(tmp_image_path):
                    os.remove(tmp_image_path)
    elif uploaded_file is None:
        st.info("Upload a receipt on the left panel and click **Process Receipt** to run OCR.")
