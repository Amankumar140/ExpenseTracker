import axios from 'axios';
import fs from 'fs';
import path from 'path';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.bmp') return 'image/bmp';
  return 'image/jpeg';
};

let mlServiceOnline = false;
let lastHealthCheck = 0;

/**
 * Ping the OCR microservice health endpoint.
 */
export async function checkMLHealth() {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, {
      timeout: 3000,
    });

    const wasOffline = !mlServiceOnline;
    mlServiceOnline = response.data?.status === 'healthy';

    if (mlServiceOnline && wasOffline) {
      console.log('\x1b[32m✓ OCR Microservice Connected\x1b[0m');
    }

    lastHealthCheck = Date.now();
    return mlServiceOnline;
  } catch {
    if (mlServiceOnline) {
      console.warn('\x1b[33m⚠ OCR Microservice offline\x1b[0m');
    }
    mlServiceOnline = false;
    lastHealthCheck = Date.now();
    return false;
  }
}

export function isMLServiceOnline() {
  return mlServiceOnline;
}

/**
 * Run OCR on a receipt image using the OCR microservice.
 *
 * @param {string} filePath - Path to the receipt image on local disk
 * @returns {Promise<{extracted_text: string, ocr_confidence: number, ocr_data: object, parsed_fields: object} | null>}
 */
export async function runOCR(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = getMimeType(filePath);
    const fileBlob = new Blob([fileBuffer], { type: mimeType });
    const formData = new FormData();
    formData.append('file', fileBlob, path.basename(filePath));

    const response = await axios.post(
      `${ML_SERVICE_URL}/ocr`,
      formData,
      {
        timeout: 300000, // 5 minute timeout for CPU-based PaddleOCR
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return {
      extracted_text: response.data.extracted_text,
      ocr_confidence: response.data.ocr_confidence,
      ocr_data: response.data.ocr_data || {},
      parsed_fields: response.data.parsed_fields || {},
    };
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.warn('OCR service unavailable (connection refused)');
      mlServiceOnline = false;
    } else if (error.code === 'ECONNABORTED') {
      console.warn('OCR service extraction request timed out');
    } else {
      console.error('OCR service error:', error.message);
    }
    return null;
  }
}

// Deprecated stubs preserved for smooth import compatibility if referenced elsewhere
export async function predictCategory() {
  return null;
}
export async function predictCategoryFromImage() {
  return null;
}
