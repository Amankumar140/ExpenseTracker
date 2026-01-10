import Tesseract from 'tesseract.js';

/**
 * Performs OCR on an image file
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<{text: string, confidence: number}>}
 */
export const performOCR = async (imagePath) => {
  try {
    const result = await Tesseract.recognize(
      imagePath,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    return {
      text: result.data.text,
      confidence: result.data.confidence
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to perform OCR on image');
  }
};

/**
 * Extracts structured data from OCR text
 * @param {string} text - Raw OCR text
 * @returns {Object} Parsed expense data
 */
export const parseExpenseData = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  const data = {
    merchant: null,
    date: null,
    total: null,
    tax: null,
    rawText: text
  };

  // Extract merchant (usually first meaningful line or contains common patterns)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (lines[i].length > 3 && !lines[i].match(/^\d+[\d\s\-\/]+$/)) {
      data.merchant = lines[i];
      break;
    }
  }

  // Extract date (common patterns: MM/DD/YYYY, DD-MM-YYYY, etc.)
  const datePattern = /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/;
  for (const line of lines) {
    const dateMatch = line.match(datePattern);
    if (dateMatch) {
      data.date = dateMatch[0];
      break;
    }
  }

  // ---------------------------------------------------------------
  // Helper: parse a currency string like "₹1,234.50" or "$50" to float
  // ---------------------------------------------------------------
  const parseCurrency = (str) => {
    if (!str) return NaN;
    // Remove currency symbols and commas, keep digits and dots
    const cleaned = str.replace(/[₹$£€,\s]/g, '');
    return parseFloat(cleaned);
  };

  // Regex to match a monetary value: optional symbol, digits with optional commas, optional decimals
  const currencyValuePattern = /[₹$£€]?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/;

  // ---------------------------------------------------------------
  // Extract total — prioritized keyword matching
  // ---------------------------------------------------------------
  // Priority 1: High-confidence keywords (grand total, net amount, etc.)
  const highPriorityTotalPatterns = [
    /grand\s*total\s*[:\-]?\s*[₹$£€]?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i,
    /net\s*amount\s*[:\-]?\s*[₹$£€]?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i,
    /final\s*amount\s*[:\-]?\s*[₹$£€]?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i,
    /bill\s*amount\s*[:\-]?\s*[₹$£€]?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i,
    /amount\s*due\s*[:\-]?\s*[₹$£€]?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i,
    /amount\s*payable\s*[:\-]?\s*[₹$£€]?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i,
  ];

  // Priority 2: Standard total keywords
  const standardTotalPatterns = [
    /total\s*[:\-]?\s*[₹$£€]?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i,
    /amount\s*[:\-]?\s*[₹$£€]?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i,
    /[₹$£€]\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\s*total/i,
    /bal(?:ance)?\s*(?:due)?\s*[:\-]?\s*[₹$£€]?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i,
  ];

  // Try high-priority patterns first
  for (const line of lines) {
    for (const pattern of highPriorityTotalPatterns) {
      const match = line.match(pattern);
      if (match) {
        const val = parseCurrency(match[1]);
        if (!isNaN(val) && val > 0) {
          data.total = val;
          break;
        }
      }
    }
    if (data.total) break;
  }

  // Try standard patterns if no high-priority match
  if (!data.total) {
    const standardMatches = [];
    for (const line of lines) {
      for (const pattern of standardTotalPatterns) {
        const match = line.match(pattern);
        if (match) {
          const val = parseCurrency(match[1]);
          if (!isNaN(val) && val > 0) {
            standardMatches.push(val);
          }
        }
      }
    }
    // Pick the largest keyword-matched total (most likely the final total)
    if (standardMatches.length > 0) {
      data.total = Math.max(...standardMatches);
    }
  }

  // Fallback: extract ALL currency amounts and pick the largest reasonable one
  if (!data.total) {
    const allAmounts = [];
    const amountPattern = /[₹$£€]\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/g;
    const plainAmountPattern = /(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?)/g;

    for (const line of lines) {
      // Currency-prefixed amounts
      let match;
      while ((match = amountPattern.exec(line)) !== null) {
        const val = parseCurrency(match[1]);
        if (!isNaN(val) && val > 0) allAmounts.push(val);
      }
      // Comma-formatted amounts without currency symbol (e.g., 1,234.50)
      while ((match = plainAmountPattern.exec(line)) !== null) {
        const val = parseCurrency(match[1]);
        if (!isNaN(val) && val > 0) allAmounts.push(val);
      }
    }

    if (allAmounts.length > 0) {
      data.total = Math.max(...allAmounts);
    }
  }

  // ---------------------------------------------------------------
  // Extract tax — flexible patterns
  // ---------------------------------------------------------------
  const taxPatterns = [
    /(?:tax|vat|gst|cgst|sgst|igst|service\s*tax)\s*[:\-]?\s*[₹$£€]?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i,
  ];
  
  for (const line of lines) {
    for (const pattern of taxPatterns) {
      const match = line.match(pattern);
      if (match) {
        const val = parseCurrency(match[1]);
        if (!isNaN(val) && val > 0) {
          data.tax = val;
          break;
        }
      }
    }
    if (data.tax) break;
  }

  return data;
};

/**
 * Calculate confidence score based on extracted data completeness
 * @param {Object} data - Parsed expense data
 * @param {number} ocrConfidence - OCR confidence score
 * @returns {number} Confidence score (0-100)
 */
export const calculateConfidence = (data, ocrConfidence) => {
  let score = ocrConfidence * 0.4; // OCR confidence is 40% of total
  
  // Add points for each field successfully extracted
  if (data.merchant) score += 15;
  if (data.date) score += 15;
  if (data.total && data.total > 0) score += 20;
  if (data.tax && data.tax > 0) score += 10;
  
  return Math.min(100, Math.round(score));
};
