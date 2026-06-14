import { lookupMerchant, categorizeExpense } from '../services/categorizationService.js';

console.log('=== STARTING CATEGORIZATION LOGIC TESTS ===');

// Test Case 1: Starbucks (Lookup)
const starbucksResult = lookupMerchant('Starbucks');
console.log('Starbucks Lookup Result:', starbucksResult);
if (starbucksResult && starbucksResult.category === 'Food & Dining' && starbucksResult.confidence === 99) {
  console.log('✓ Starbucks Lookup test passed!');
} else {
  console.error('✗ Starbucks Lookup test failed!');
}

// Test Case 2: Uber (Lookup)
const uberResult = lookupMerchant('Uber');
console.log('Uber Lookup Result:', uberResult);
if (uberResult && uberResult.category === 'Transportation' && uberResult.confidence === 99) {
  console.log('✓ Uber Lookup test passed!');
} else {
  console.error('✗ Uber Lookup test failed!');
}

// Test Case 3: Swiggy (Lookup)
const swiggyResult = lookupMerchant('Swiggy');
console.log('Swiggy Lookup Result:', swiggyResult);
if (swiggyResult && swiggyResult.category === 'Food & Dining' && swiggyResult.confidence === 99) {
  console.log('✓ Swiggy Lookup test passed!');
} else {
  console.error('✗ Swiggy Lookup test failed!');
}

// Test Case 4: Non-existent (Fallback to null)
const unknownResult = lookupMerchant('Random Inc');
console.log('Random Inc Lookup Result (expect null):', unknownResult);
if (unknownResult === null) {
  console.log('✓ Non-existent Lookup test passed!');
} else {
  console.error('✗ Non-existent Lookup test failed!');
}

// Test Case 5: Keyword fallback check
const keywordResult = categorizeExpense('Random Cafe', 'coffee total $5');
console.log('Keyword Result:', keywordResult);
if (keywordResult.category === 'Food & Dining') {
  console.log('✓ Keyword fallback test passed!');
} else {
  console.error('✗ Keyword fallback test failed!');
}

console.log('=== CATEGORIZATION LOGIC TESTS COMPLETE ===');
