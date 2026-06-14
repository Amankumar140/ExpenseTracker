import test from 'node:test';
import assert from 'node:assert/strict';
import { extractReceiptFields, normalizeCurrency } from '../services/fieldExtractionEngine.js';

test('normalizes Indian currency formats', () => {
  assert.equal(normalizeCurrency('₹1,234.50'), 1234.5);
  assert.equal(normalizeCurrency('Rs. 40'), 40);
});

test('selects labeled total and ignores subtotal/tax', () => {
  const result = extractReceiptFields('Tax Invoice\nACME CAFE\nSubtotal ₹100\nGST ₹18\nGrand Total ₹118\n20/07/2026');
  assert.equal(result.merchant, 'ACME CAFE');
  assert.equal(result.total, 118);
  assert.equal(result.tax, 18);
  assert.equal(result.date, '20/07/2026');
});

test('uses nearby layout values when label and value are split', () => {
  const result = extractReceiptFields('', { lines: [
    { text: 'Bill Total', bbox: { x: 10, y: 500, width: 90, height: 20 } },
    { text: '₹ 785.00', bbox: { x: 250, y: 500, width: 90, height: 20 } },
  ] });
  assert.equal(result.total, 785);
});
