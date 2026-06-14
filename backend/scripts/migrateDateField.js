import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/database.js';
import Expense from '../models/Expense.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from the backend folder
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Parses multiple string formats gracefully into a Date object.
 * @param {string|Date} str - Raw date value
 * @returns {Date|null} Proper Date object or null if invalid
 */
function parseDateString(str) {
  if (!str) return null;
  if (str instanceof Date) {
    return isNaN(str.getTime()) ? null : str;
  }
  if (typeof str !== 'string') return null;
  str = str.trim();
  if (!str) return null;

  // 1. Try native Date constructor (works for ISO, YYYY-MM-DD, etc.)
  let d = new Date(str);
  if (!isNaN(d.getTime())) return d;

  // 2. Handle DD-MM-YYYY or MM-DD-YYYY separated by - or /
  const parts = str.split(/[-\/]/);
  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);

    // If YYYY-MM-DD
    if (parts[0].length === 4) {
      d = new Date(p0, p1 - 1, p2);
      if (!isNaN(d.getTime())) return d;
    }

    // If DD-MM-YYYY or MM-DD-YYYY (year is p2, e.g. 2025)
    if (parts[2].length === 4 || parts[2].length === 2) {
      let year = p2;
      if (parts[2].length === 2) {
        year = p2 < 50 ? 2000 + p2 : 1900 + p2; // 2-digit year window
      }

      // Check if p0 is definitely day (> 12) -> DD-MM-YYYY
      if (p0 > 12 && p0 <= 31 && p1 <= 12) {
        return new Date(year, p1 - 1, p0);
      }
      // Check if p1 is definitely day (> 12) -> MM-DD-YYYY
      if (p1 > 12 && p1 <= 31 && p0 <= 12) {
        return new Date(year, p0 - 1, p1);
      }
      // Default fallback for ambiguous dates (assume MM-DD-YYYY)
      if (p0 <= 12 && p1 <= 12) {
        return new Date(year, p0 - 1, p1);
      }
    }
  }

  return null;
}

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully.');

    const expenses = await Expense.find({});
    console.log(`Found ${expenses.length} expenses to migrate.`);

    let updatedCount = 0;
    let failedCount = 0;

    for (const expense of expenses) {
      const rawDate = expense.date;
      
      const parsedDate = parseDateString(rawDate);

      if (parsedDate) {
        expense.date = parsedDate;
        await expense.save();
        updatedCount++;
      } else {
        console.warn(`[Warning] Could not parse date "${rawDate}" for expense ID: ${expense._id}. Falling back to createdAt.`);
        expense.date = expense.createdAt;
        await expense.save();
        failedCount++;
      }
    }

    console.log('\nMigration Completed:');
    console.log(`- Successfully converted: ${updatedCount} records`);
    console.log(`- Failed (fell back to createdAt): ${failedCount} records`);

    await mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed with error:', error);
    process.exit(1);
  }
}

runMigration();
