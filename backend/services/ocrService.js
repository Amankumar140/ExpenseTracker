import { extractReceiptFields } from './fieldExtractionEngine.js';

/** Compatibility facade for existing routes; accepts optional PaddleOCR layout. */
export const parseExpenseData = (text, ocrData = {}) => extractReceiptFields(text, ocrData);

export const validateMerchantName = (merchant) => Boolean(merchant && merchant !== 'Unknown Merchant' && merchant.trim().length >= 2);

export const calculateConfidence = (data, ocrConfidence = 0) => {
  const fields = data.fieldConfidence || {};
  const extraction = ['merchant', 'date', 'total', 'tax'].reduce((sum, field) => sum + (fields[field] || 0), 0) / 4;
  return Math.min(100, Math.round((ocrConfidence * 0.4) + (extraction * 60)));
};
