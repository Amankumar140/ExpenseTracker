import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/database.js';
import Expense from '../models/Expense.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function runInspection() {
  try {
    await connectDB();

    // 1. Count of needsReview true vs false
    const countTrue = await Expense.countDocuments({ needsReview: true });
    const countFalse = await Expense.countDocuments({ needsReview: false });
    console.log('=== 1. NEEDS REVIEW COUNTS ===');
    console.log(`needsReview: true  -> ${countTrue} records`);
    console.log(`needsReview: false -> ${countFalse} records`);
    console.log('==============================\n');

    // 2. 5 random records where needsReview is true
    const trueRecords = await Expense.find({ needsReview: true });
    // Shuffle and pick 5
    const shuffled = trueRecords.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    console.log('=== 2. 5 RANDOM RECORDS REQUIRING REVIEW ===');
    selected.forEach((rec, idx) => {
      console.log(`Record #${idx + 1}:`);
      console.log(`  ID:                   ${rec._id}`);
      console.log(`  Merchant:             "${rec.merchant}"`);
      console.log(`  Total:                ${rec.total === null ? 'null' : `₹${rec.total}`}`);
      console.log(`  Extraction Confidence: ${rec.extractionConfidence}%`);
      console.log(`  Category Confidence:   ${rec.categoryConfidence}%`);
      console.log(`  Overall Confidence:    ${rec.confidence}%`);
      console.log('------------------------------');
    });
    console.log('============================================\n');

    // 3. Specifically check: Pack No: LST1004
    const specRecord = await Expense.findOne({ merchant: /Pack No/i });
    console.log('=== 3. SPECIFIC RECORD INSPECTION ===');
    if (specRecord) {
      console.log(`Found Record:`);
      console.log(`  Merchant:             "${specRecord.merchant}"`);
      console.log(`  Total:                ₹${specRecord.total}`);
      console.log(`  needsReview:          ${specRecord.needsReview}`);
      console.log(`  Extraction Confidence: ${specRecord.extractionConfidence}%`);
      console.log(`  Category Confidence:   ${specRecord.categoryConfidence}%`);
    } else {
      console.log('Could not find record containing "Pack No". Listing all records to find it:');
      const allRecs = await Expense.find({});
      allRecs.forEach(r => console.log(`  - "${r.merchant}" (Total: ₹${r.total}, needsReview: ${r.needsReview})`));
    }
    console.log('======================================\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Inspection failed:', error);
  }
}

runInspection();
