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

  // Extract total (look for patterns like "Total: $XX.XX", "TOTAL XX.XX", etc.)
  const totalPatterns = [
    /total[:\s]*\$?(\d+\.\d{2})/i,
    /amount[:\s]*\$?(\d+\.\d{2})/i,
    /\$(\d+\.\d{2})\s*total/i
  ];
  
  for (const line of lines) {
    for (const pattern of totalPatterns) {
      const match = line.match(pattern);
      if (match) {
        data.total = parseFloat(match[1]);
        break;
      }
    }
    if (data.total) break;
  }

  // If total not found, look for largest dollar amount
  if (!data.total) {
    const amounts = [];
    for (const line of lines) {
      const amountMatches = line.match(/\$?(\d+\.\d{2})/g);
      if (amountMatches) {
        amounts.push(...amountMatches.map(a => parseFloat(a.replace('$', ''))));
      }
    }
    if (amounts.length > 0) {
      data.total = Math.max(...amounts);
    }
  }

  // Extract tax (look for patterns like "Tax: $X.XX", "TAX X.XX", etc.)
  const taxPatterns = [
    /tax[:\s]*\$?(\d+\.\d{2})/i,
    /vat[:\s]*\$?(\d+\.\d{2})/i,
    /gst[:\s]*\$?(\d+\.\d{2})/i
  ];
  
  for (const line of lines) {
    for (const pattern of taxPatterns) {
      const match = line.match(pattern);
      if (match) {
        data.tax = parseFloat(match[1]);
        break;
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
