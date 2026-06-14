import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/database.js';
import Expense from '../models/Expense.js';
import mongoose from 'mongoose';
import { validateMerchantName } from '../services/ocrService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Simple helper to calculate extraction confidence for existing records
function getExtractionConfidence(expense) {
  let score = (expense.rawText ? 85 : 0) * 0.4;
  
  if (expense.merchant && expense.merchant !== 'Unknown Merchant' && expense.merchant !== 'Unknown') {
    score += 15;
  }
  
  // Exclude default placeholder dates (equal to createdAt or missing)
  const isDefaultDate = expense.createdAt && Math.abs(new Date(expense.date).getTime() - new Date(expense.createdAt).getTime()) < 5000;
  if (expense.date && !isDefaultDate) {
    score += 15;
  }
  
  if (expense.total && expense.total > 0) {
    score += 20;
  }
  if (expense.tax && expense.tax > 0) {
    score += 10;
  }
  return Math.min(100, Math.round(score));
}

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully.');

    const expenses = await Expense.find({});
    console.log(`Found ${expenses.length} total expense records to examine.`);

    let updatedCount = 0;

    for (const expense of expenses) {
      let changed = false;

      // 1. Validate Merchant Name
      const isMerchantValid = validateMerchantName(expense.merchant) && 
                              expense.merchant !== 'Unknown' && 
                              expense.merchant !== 'Unknown Merchant';
      
      if (!isMerchantValid) {
        if (expense.merchant !== 'Unknown Merchant') {
          console.log(`- Flagging invalid merchant name "${expense.merchant}" (ID: ${expense._id})`);
          expense.merchant = 'Unknown Merchant';
          changed = true;
        }
      }

      // 2. Validate Total
      const isTotalValid = expense.total !== null && expense.total !== undefined && expense.total > 0;
      if (!isTotalValid) {
        if (expense.total !== null) {
          console.log(`- Flagging invalid/zero total ₹${expense.total} -> null (ID: ${expense._id})`);
          expense.total = null;
          changed = true;
        }
      }

      // 3. Evaluate needsReview
      const shouldNeedReview = !isMerchantValid || !isTotalValid;
      if (expense.needsReview !== shouldNeedReview) {
        expense.needsReview = shouldNeedReview;
        changed = true;
      }

      // 4. Fill in extractionConfidence (always recalculate to apply new rules)
      const calculatedConf = getExtractionConfidence(expense);
      if (expense.extractionConfidence !== calculatedConf) {
        expense.extractionConfidence = calculatedConf;
        changed = true;
      }
      
      if (changed) {
        await expense.save();
        updatedCount++;
      }
    }

    console.log('\nMigration Completed:');
    console.log(`- Checked: ${expenses.length} records`);
    console.log(`- Updated / Flagged: ${updatedCount} records`);

    await mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed with error:', error);
    process.exit(1);
  }
}

runMigration();
