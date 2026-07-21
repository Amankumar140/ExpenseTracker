import express from 'express';
import Expense from '../models/Expense.js';
import upload from '../middleware/upload.js';
import { parseExpenseData, calculateConfidence } from '../services/ocrService.js';
import { categorizeExpense, manualCategorize, lookupMerchant } from '../services/categorizationService.js';
import { predictCategory, predictCategoryFromImage, runOCR } from '../services/mlService.js';
import { Parser } from 'json2csv';
import { validate, validateQuery, updateExpenseSchema, queryExpenseSchema } from '../utils/validation.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Define rate limiter for receipt uploads: 10 requests per 15 minutes per IP
const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many receipt uploads from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/expenses/upload - Upload and process receipt
router.post('/upload', uploadRateLimiter, (req, res, next) => {
  upload.single('receipt')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Call FastAPI service to run OCR on the image
    const ocrResponse = await runOCR(req.file.path);
    const text = ocrResponse?.extracted_text || '';

    // If OCR returned empty or service is offline, fallback gracefully
    const isOcrAvailable = Boolean(ocrResponse && text.trim());
    const parsedData = isOcrAvailable 
      ? parseExpenseData(text, ocrResponse?.ocr_data)
      : { merchant: 'Receipt Upload', total: null, tax: 0, date: new Date().toISOString() };

    let mlPrediction = null;
    let categoryResult = null;
    let categorizationSource = '';

    // Step 1: Check merchant-category lookup table FIRST
    const lookupResult = lookupMerchant(parsedData.merchant);
    
    if (lookupResult) {
      categoryResult = lookupResult;
      categorizationSource = 'lookup';
    }

    // Step 2: Fall back to rule-based keyword categorization
    if (!categoryResult) {
      const keywordResult = categorizeExpense(parsedData.merchant, text);
      categoryResult = {
        category: keywordResult.category,
        confidence: keywordResult.confidence,
        matchedKeywords: keywordResult.matchedKeywords
      };
      categorizationSource = 'keyword';
    }
    
    // Total validation
    let finalTotal = parsedData.total;
    if (finalTotal === undefined || finalTotal === null || isNaN(finalTotal) || finalTotal <= 0) {
      finalTotal = null;
    }

    // Determine if the record needs review
    const needsReview = (!isOcrAvailable || finalTotal === null || parsedData.merchant === 'Unknown Merchant' || parsedData.merchant === 'Receipt Upload');

    // Calculate confidence scores
    const ocrConfidence = ocrResponse?.ocr_confidence !== undefined
      ? Math.round(ocrResponse.ocr_confidence * 100)
      : (text ? 85 : 0);
    const extractionConfidence = calculateConfidence({ ...parsedData, total: finalTotal }, ocrConfidence);
    const overallConfidence = extractionConfidence;

    // Parse structured transaction date
    let transactionDate = new Date();
    if (parsedData.date) {
      const parsedDate = new Date(parsedData.date);
      if (!isNaN(parsedDate.getTime())) {
        transactionDate = parsedDate;
      }
    }

    // Create expense document
    const expense = new Expense({
      userId: req.user._id,
      merchant: parsedData.merchant || 'Unknown Merchant',
      date: transactionDate,
      total: finalTotal,
      tax: parsedData.tax || 0,
      category: categoryResult.category,
      confidence: overallConfidence,
      categoryConfidence: categoryResult.confidence,
      extractionConfidence,
      needsReview,
      matchedKeywords: categoryResult.matchedKeywords,
      imagePath: `/uploads/${req.file.filename}`,
      rawText: text,
      mlCategory: mlPrediction?.category || null,
      mlConfidence: mlPrediction?.confidence || null,
      categorizationSource
    });

    await expense.save();

    res.status(201).json({
      message: 'Receipt processed successfully',
      expense
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to process receipt', error: error.message });
  }
});

// GET /api/expenses - Get all expenses with optional filters
router.get('/', validateQuery(queryExpenseSchema), async (req, res) => {
  try {
    const { category, startDate, endDate, minAmount, maxAmount, year, sort = '-createdAt' } = req.query;
    
    const filter = { userId: req.user._id };
    
    if (category) {
      filter.category = category;
    }
    
    if (minAmount !== undefined || maxAmount !== undefined) {
      filter.total = {};
      if (minAmount !== undefined) filter.total.$gte = minAmount;
      if (maxAmount !== undefined) filter.total.$lte = maxAmount;
    }

    // Filter by year natively
    if (year && year !== 'all') {
      const selectedYear = parseInt(year);
      const startOfYear = new Date(Date.UTC(selectedYear, 0, 1));
      const endOfYear = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59, 999));
      filter.date = {
        $gte: startOfYear,
        $lte: endOfYear
      };
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      filter.date = filter.date || {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter).sort(sort);
    
    res.json({
      count: expenses.length,
      expenses
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Failed to fetch expenses', error: error.message });
  }
});

// GET /api/expenses/dashboard/stats - Get dashboard quick stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const statsResult = await Expense.aggregate([
      { $match: { userId } },
      {
        $facet: {
          totalCount: [
            { $count: "count" }
          ],
          allTimeSpent: [
            { $group: { _id: null, total: { $sum: "$total" } } }
          ],
          currentMonthSpent: [
            { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }
          ],
          lastExpense: [
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            {
              $project: {
                merchant: 1,
                total: 1,
                date: 1,
                category: 1
              }
            }
          ]
        }
      }
    ]);

    const result = statsResult[0] || {};
    const totalExpenses = result.totalCount?.[0]?.count || 0;
    const totalSpent = result.allTimeSpent?.[0]?.total || 0;
    const thisMonthTotal = result.currentMonthSpent?.[0]?.total || 0;
    const thisMonthCount = result.currentMonthSpent?.[0]?.count || 0;
    const lastExpense = result.lastExpense?.[0] || null;

    res.json({
      totalExpenses,
      thisMonthTotal: thisMonthTotal.toFixed(2),
      totalSpent: totalSpent.toFixed(2),
      thisMonthCount,
      lastExpense
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
});

// GET /api/expenses/analytics/summary - Get analytics data
router.get('/analytics/summary', async (req, res) => {
  try {
    const { year } = req.query;
    const userId = req.user._id;
    
    // Get unique years dynamically from database based on transaction date
    const availableYearsResult = await Expense.aggregate([
      { $match: { userId } },
      { $project: { year: { $year: '$date' } } },
      { $group: { _id: '$year' } },
      { $sort: { _id: -1 } }
    ]);
    
    const availableYears = availableYearsResult
      .map(r => r._id)
      .filter(y => y !== null && y !== undefined);
    
    const matchStage = { userId };
    
    if (year && year !== 'all') {
      const selectedYear = parseInt(year);
      const start = new Date(Date.UTC(selectedYear, 0, 1));
      const end = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59, 999));
      matchStage.date = { $gte: start, $lte: end };
    }
    
    // Perform facet aggregation
    const analyticsResult = await Expense.aggregate([
      { $match: matchStage },
      {
        $facet: {
          categoryBreakdown: [
            {
              $group: {
                _id: "$category",
                total: { $sum: "$total" },
                count: { $sum: 1 }
              }
            }
          ],
          monthlySpending: [
            {
              $group: {
                _id: { $dateToString: { format: "%b %Y", date: "$date" } },
                total: { $sum: "$total" }
              }
            }
          ],
          stats: [
            {
              $group: {
                _id: null,
                totalExpenses: { $sum: 1 },
                totalSpent: { $sum: "$total" },
                averageExpense: { $avg: "$total" },
                totalTax: { $sum: "$tax" }
              }
            }
          ]
        }
      }
    ]);

    const result = analyticsResult[0] || {};
    
    // 1. Format Category Breakdown
    const categoryBreakdown = {};
    (result.categoryBreakdown || []).forEach(item => {
      categoryBreakdown[item._id] = {
        total: item.total,
        count: item.count
      };
    });

    // 2. Format Monthly Spending
    const monthlySpending = {};
    const monthlySpendingList = result.monthlySpending || [];
    
    // Sort monthly spending list chronologically by converting string date format "Oct 2025"
    monthlySpendingList.sort((a, b) => {
      return new Date(a._id) - new Date(b._id);
    });
    
    monthlySpendingList.forEach(item => {
      monthlySpending[item._id] = item.total;
    });

    // 3. Format Stats Summary
    const statsSummary = result.stats?.[0] || {
      totalExpenses: 0,
      totalSpent: 0,
      averageExpense: 0,
      totalTax: 0
    };

    res.json({
      categoryBreakdown,
      monthlySpending,
      availableYears,
      stats: {
        totalExpenses: statsSummary.totalExpenses || 0,
        totalSpent: (statsSummary.totalSpent || 0).toFixed(2),
        averageExpense: (statsSummary.averageExpense || 0).toFixed(2),
        totalTax: (statsSummary.totalTax || 0).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to generate analytics', error: error.message });
  }
});

// GET /api/expenses/export/csv - Export expenses as CSV
router.get('/export/csv', async (req, res) => {
  try {
    const { year } = req.query;
    const filter = { userId: req.user._id };
    
    if (year && year !== 'all') {
      const selectedYear = parseInt(year);
      const start = new Date(Date.UTC(selectedYear, 0, 1));
      const end = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59, 999));
      filter.date = { $gte: start, $lte: end };
    }
    
    const expenses = await Expense.find(filter).sort('-createdAt');
    
    const fields = ['merchant', 'date', 'total', 'tax', 'category', 'confidence', 'categoryConfidence', 'notes', 'createdAt'];
    const opts = { fields };
    
    const parser = new Parser(opts);
    const csv = parser.parse(expenses);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('expenses.csv');
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ message: 'Failed to export CSV', error: error.message });
  }
});

// GET /api/expenses/:id - Get single expense
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ message: 'Failed to fetch expense', error: error.message });
  }
});

// PUT /api/expenses/:id - Update expense
router.put('/:id', validate(updateExpenseSchema), async (req, res) => {
  try {
    const { merchant, date, total, tax, category, notes } = req.body;
    
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Update fields
    if (merchant !== undefined) expense.merchant = merchant;
    if (date !== undefined) expense.date = date;
    if (total !== undefined) expense.total = total;
    if (tax !== undefined) expense.tax = tax;
    if (notes !== undefined) expense.notes = notes;
    
    // If category is manually changed, update with full confidence
    if (category !== undefined && category !== expense.category) {
      const categoryResult = manualCategorize(category);
      expense.category = categoryResult.category;
      expense.categoryConfidence = categoryResult.confidence;
      expense.matchedKeywords = categoryResult.matchedKeywords;
    }

    // Re-evaluate needsReview flag
    if (expense.merchant && expense.merchant !== 'Unknown Merchant' && expense.total !== null && expense.total !== undefined && expense.total > 0) {
      expense.needsReview = false;
    } else {
      expense.needsReview = true;
    }

    await expense.save();
    
    res.json({
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Failed to update expense', error: error.message });
  }
});

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Failed to delete expense', error: error.message });
  }
});

export default router;

