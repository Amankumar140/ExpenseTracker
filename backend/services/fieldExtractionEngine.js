/** Layout-aware receipt Field Extraction Engine.
 * Each extractor returns ranked candidates and the selected value/confidence.
 */
const moneyPattern = /(?:₹|rs\.?|inr|\$)?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)(?!%)/gi;
const excludedTotal = /sub\s*total|item\s*total|discount|(?<!\btotal\s*(?:inclusive|excluding)\s*)(?:tax|cgst|sgst|igst)|platform\s*fee|packing|delivery\s*charge/i;
const totalLabels = [
  [/grand\s*total/i, 100], [/bill\s*total/i, 98], [/amount\s*paid/i, 96],
  [/net\s*amount/i, 94], [/amount\s*payable/i, 92], [/final\s*total/i, 90],
  [/total\s*amount/i, 88], [/total\s*inclusive\s*(?:of\s*)?gst/i, 86],
  [/total\s*excluding\s*gst/i, 84], [/total\s*(?:incl|excl)\s*gst/i, 82],
  [/\btotal\b/i, 70],
];

/** Normalize concatenated OCR text by inserting spaces at word boundaries. */
const _receiptKeywords = [
  // Order: longest first to avoid partial matches
  'TOTAL INCLUSIVE GST', 'TOTAL EXCLUDING GST', 'TOTAL INCL GST', 'TOTAL EXCL GST',
  'GRAND TOTAL', 'BILL TOTAL', 'AMOUNT PAID', 'NET AMOUNT', 'AMOUNT PAYABLE',
  'FINAL TOTAL', 'TOTAL AMOUNT', 'TOTAL GST', 'TOTAL TAX', 'SUB TOTAL',
  'GST REG', 'COMPANY NO', 'THANK YOU', 'PLEASE COME AGAIN',
  'CREDIT CARD', 'DEBIT CARD', 'NET BANKING',
];
const _kwPattern = new RegExp(
  _receiptKeywords.map(kw => kw.replace(/ /g, '\\s*')).join('|'), 'gi'
);
const normalizeOcrText = (text) => {
  if (!text) return '';
  let s = text;
  // 1. Keyword-based: "TOTALINCLUSIVEGST" → "TOTAL INCLUSIVE GST"
  s = s.replace(_kwPattern, (match) => {
    for (const kw of _receiptKeywords) {
      if (new RegExp('^' + kw.replace(/ /g, '\\s*') + '$', 'i').test(match)) return kw;
    }
    return match;
  });
  // 2. camelCase / PascalCase: "MidValleyMegamall" → "Mid Valley Megamall"
  s = s.replace(/([a-z])([A-Z])/g, '$1 $2');
  // 3. Letter → digit: "ITEMS2" → "ITEMS 2"
  s = s.replace(/([A-Za-z])(\d)/g, '$1 $2');
  // 4. Digit → letter: "149.80CASH" → "149.80 CASH"
  s = s.replace(/(\d)([A-Za-z])/g, '$1 $2');
  // 5. Space after colon if followed by non-space/non-digit
  s = s.replace(/:([^\s\d])/g, ': $1');
  // 6. Collapse multiple spaces
  return s.replace(/\s{2,}/g, ' ').trim();
};

export const normalizeCurrency = (raw) => {
  if (raw === null || raw === undefined) return null;
  const cleaned = String(raw).replace(/(?:₹|rs\.?|inr|\$|\s|,)/gi, '');
  if (!/^\d+(?:\.\d{1,2})?$/.test(cleaned)) return null;
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) && value >= 0 ? value : null;
};

const box = (line, index) => line?.bbox || { x: 0, y: index * 24, width: 0, height: 20 };
export const toLines = (text = '', layout = {}) => {
  const source = Array.isArray(layout?.lines) && layout.lines.length ? layout.lines : text.split(/\r?\n/).map((line) => ({ text: line }));
  return source.map((line, index) => {
    const rawText = String(line.text || '').trim();
    const normalized = normalizeOcrText(rawText);
    return { ...line, text: normalized, rawText, bbox: box(line, index), index };
  }).filter((line) => line.text);
};

const nearbyValues = (line, lines) => {
  const values = [];
  const add = (text, distance = 0) => {
    for (const match of text.matchAll(moneyPattern)) {
      const value = normalizeCurrency(match[0]);
      if (value !== null) values.push({ value, distance });
    }
  };
  add(line.text);
  for (const candidate of lines) {
    if (candidate === line) continue;
    const sameRow = Math.abs(candidate.bbox.y - line.bbox.y) <= Math.max(line.bbox.height, 24);
    const below = candidate.bbox.y > line.bbox.y && candidate.bbox.y - line.bbox.y < 75;
    if (sameRow || below) add(candidate.text, Math.abs(candidate.bbox.y - line.bbox.y) + Math.abs(candidate.bbox.x - line.bbox.x) / 8);
  }
  return values;
};

class BaseExtractor {
  select(candidates) {
    const sorted = candidates.filter((item) => item.value !== null && item.value !== undefined).sort((a, b) => b.score - a.score);
    return { value: sorted[0]?.value ?? null, confidence: Math.max(0, Math.min(1, (sorted[0]?.score || 0) / 100)), candidates: sorted };
  }
}

export class MerchantExtractor extends BaseExtractor {
  extract(lines) {
    const ignored = /gstin|tax\s*invoice|invoice|bill\s*details|order\s*id|terminal|phone|fssai|\bcin\b|address|mobile|tel\.?|www\.|http|customer/i;
    const candidates = lines.slice(0, Math.max(5, Math.ceil(lines.length * 0.35))).flatMap((line) => {
      const text = line.text.replace(/\s+/g, ' ').trim();
      if (ignored.test(text) || /^\d+[\d\s\-/.:]*$/.test(text) || text.length < 3) return [];
      const letters = (text.match(/[A-Za-z]/g) || []).length;
      if (letters < 2) return [];
      const score = 94 - line.index * 6 + Math.min(10, letters / 3) - (/[,:;]/.test(text) ? 12 : 0);
      return [{ value: normalizeMerchant(text), score, line }];
    });
    return this.select(candidates);
  }
}

const normalizeMerchant = (value) => value.replace(/\b(private limited|pvt\.?\s*ltd\.?|ltd\.?)\b/ig, '').replace(/\s{2,}/g, ' ').trim();

export class DateExtractor extends BaseExtractor {
  extract(lines) {
    const candidates = [];
    const pattern = /\b(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/g;
    for (const line of lines) for (const match of line.text.matchAll(pattern)) {
      const value = validDate(match[1]);
      if (value) candidates.push({ value, score: 85 - line.index * 0.5 + (/date|dated/i.test(line.text) ? 10 : 0), line });
    }
    return this.select(candidates);
  }
}

const validDate = (raw) => {
  const parts = raw.split(/[-/]/).map(Number);
  let year, month, day;
  if (String(parts[0]).length === 4) [year, month, day] = parts;
  else { [day, month, year] = parts; if (year < 100) year += 2000; }
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? raw : null;
};

export class TotalExtractor extends BaseExtractor {
  extract(lines) {
    const candidates = [];
    for (const line of lines) {
      if (excludedTotal.test(line.text)) continue;
      for (const [label, base] of totalLabels) if (label.test(line.text)) {
        for (const amount of nearbyValues(line, lines)) candidates.push({ value: amount.value, score: base - Math.min(20, amount.distance / 8), line });
      }
    }
    return this.select(candidates);
  }
}

export class TaxExtractor extends BaseExtractor {
  extract(lines) {
    const candidates = [];
    const label = /\b(?:taxes?|gst|cgst|sgst|igst|vat)\b/i;
    // "TOTAL GST" / "TOTAL TAX" = tax amount; "TOTAL INCLUSIVE GST" / "GRAND TOTAL" = receipt total
    const isReceiptTotal = /(?:inclusive|excluding|incl|excl|grand|bill|net|amount|final)\s*(?:of\s*)?(?:gst|tax)?|(?:gst|tax)\s*(?:inclusive|excluding)/i;
    for (const line of lines) {
      // GSTIN / registration numbers are identifiers, not tax amounts.
      if (!label.test(line.text) || /gstin|reg\.?\s*no|registration/i.test(line.text)) continue;
      // Skip receipt total lines, but keep "TOTAL GST" / "TOTAL TAX" lines
      if (/total/i.test(line.text) && isReceiptTotal.test(line.text)) continue;
      for (const amount of nearbyValues(line, lines)) candidates.push({ value: amount.value, score: 85 - Math.min(25, amount.distance / 8), line });
    }
    return this.select(candidates);
  }
}

export class CurrencyExtractor extends BaseExtractor {
  extract(lines) {
    const candidates = [];
    for (const line of lines) for (const match of line.text.matchAll(moneyPattern)) {
      const value = normalizeCurrency(match[0]);
      if (value !== null) candidates.push({ value, score: /₹|rs\.?|inr|\$/i.test(match[0]) ? 80 : 60, line });
    }
    return this.select(candidates);
  }
}

export class PaymentMethodExtractor extends BaseExtractor {
  extract(lines) {
    const candidates = [];
    for (const line of lines) {
      const match = line.text.match(/\b(upi|cash|credit\s*card|debit\s*card|visa|mastercard|card|wallet|net\s*banking)\b/i);
      if (match) candidates.push({ value: match[1].toUpperCase(), score: 85 - line.index, line });
    }
    return this.select(candidates);
  }
}

export const extractReceiptFields = (text, layout) => {
  const lines = toLines(text, layout);
  const merchant = new MerchantExtractor().extract(lines);
  const date = new DateExtractor().extract(lines);
  const total = new TotalExtractor().extract(lines);
  const tax = new TaxExtractor().extract(lines);
  const currency = new CurrencyExtractor().extract(lines);
  const paymentMethod = new PaymentMethodExtractor().extract(lines);
  return {
    merchant: merchant.value || 'Unknown Merchant', date: date.value, total: total.value, tax: tax.value,
    currency: currency.value, paymentMethod: paymentMethod.value, rawText: text,
    fieldConfidence: { merchant: merchant.confidence, date: date.confidence, total: total.confidence, tax: tax.confidence, currency: currency.confidence, paymentMethod: paymentMethod.confidence },
  };
};

