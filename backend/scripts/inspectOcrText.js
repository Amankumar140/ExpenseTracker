import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/database.js';
import Expense from '../models/Expense.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  try {
    await connectDB();

    const rec = await Expense.findById('6a5b441e89c7020b1694aa7e');
    if (!rec) {
      console.log('Record not found.');
      await mongoose.disconnect();
      return;
    }

    console.log('=== RAW OCR TEXT ===');
    console.log(rec.rawText);
    console.log('====================\n');

    console.log('Testing total-parsing regex patterns...');
    const lines = rec.rawText.split('\n').map(line => line.trim()).filter(Boolean);
    
    const standardTotalPatterns = [
      /total\s*[:\-]?\s*[₹$£€]?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i,
      /amount\s*[:\-]?\s*[₹$£€]?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i,
      /[₹$£€]\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\s*total/i,
      /bal(?:ance)?\s*(?:due)?\s*[:\-]?\s*[₹$£€]?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i,
    ];

    console.log('Lines in OCR text:');
    lines.forEach((line, idx) => {
      console.log(`Line ${idx + 1}: ${JSON.stringify(line)}`);
    });

    console.log('\nMatching each standard regex against the lines:');
    for (const pattern of standardTotalPatterns) {
      console.log(`\nPattern: ${pattern.toString()}`);
      let patternMatched = false;
      for (const line of lines) {
        const match = line.match(pattern);
        if (match) {
          patternMatched = true;
          console.log(`  Matched line: ${JSON.stringify(line)}`);
          console.log(`  Capture group 1: ${JSON.stringify(match[1])}`);
        }
      }
      if (!patternMatched) {
        console.log('  No match found.');
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error running script:', error);
  }
}

run();
