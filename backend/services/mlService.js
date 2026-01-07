import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_TIMEOUT_MS = 10000; // 10 second timeout
const HEALTH_CHECK_INTERVAL_MS = 60000; // Re-check every 60 seconds

// ---------------------------------------------------------------------------
// In-memory ML service status
// ---------------------------------------------------------------------------
let mlServiceOnline = false;
let lastHealthCheck = 0;

/**
 * Ping the ML service health endpoint.
 * Updates the in-memory status flag.
 */
export async function checkMLHealth() {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, {
      timeout: 3000,
    });

    const wasOffline = !mlServiceOnline;
    mlServiceOnline = response.data?.model_loaded === true;

    if (mlServiceOnline && wasOffline) {
      console.log('\x1b[32m✓ ML Service Connected\x1b[0m');
    }

    lastHealthCheck = Date.now();
    return mlServiceOnline;
  } catch {
    if (mlServiceOnline) {
      // Was online, now went offline
      console.warn('\x1b[33m⚠ ML Service went offline — Using fallback categorization\x1b[0m');
    }
    mlServiceOnline = false;
    lastHealthCheck = Date.now();
    return false;
  }
}

/**
 * Get the current ML service status.
 */
export function isMLServiceOnline() {
  return mlServiceOnline;
}

/**
 * Predict expense category using the ML microservice.
 * Skips the API call entirely if ML service is known to be offline.
 *
 * @param {string} text - Raw receipt text (OCR output)
 * @returns {Promise<{category: string, confidence: number} | null>}
 *          Prediction result, or null if the ML service is unavailable.
 */
export async function predictCategory(text) {
  if (!text || !text.trim()) {
    return null;
  }

  // Re-check health if stale (service may have come back online)
  if (!mlServiceOnline && Date.now() - lastHealthCheck > HEALTH_CHECK_INTERVAL_MS) {
    await checkMLHealth();
  }

  // Skip API call if ML service is offline — avoid delay
  if (!mlServiceOnline) {
    return null;
  }

  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/predict-category`,
      { text },
      {
        timeout: ML_TIMEOUT_MS,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return {
      category: response.data.category,
      confidence: response.data.confidence,
    };
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.warn('ML service unavailable (connection refused)');
      mlServiceOnline = false;
    } else if (error.code === 'ECONNABORTED') {
      console.warn('ML service request timed out');
    } else {
      console.error('ML service error:', error.message);
    }
    return null;
  }
}
