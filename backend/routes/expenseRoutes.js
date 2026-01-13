import express from 'express';
import Expense from '../models/Expense.js';
import upload from '../middleware/upload.js';
import { performOCR, parseExpenseData, calculateConfidence } from '../services/ocrService.js';
import { categorizeExpense, manualCategorize } from '../services/categorizationService.js';
import { predictCategory } from '../services/mlService.js';
import { Parser } from 'json2csv';

const router = express.Router();

// POST /api/expenses/upload - Upload and process receipt
router.post('/upload', (req, res, next) => {
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

    // Perform OCR
    const { text, confidence: ocrConfidence } = await performOCR(req.file.path);
    
    // Parse expense data
    const parsedData = parseExpenseData(text);
    
    // Categorize expense — ML-first, keyword fallback only if ML unavailable
    const mlPrediction = await predictCategory(text);
    let categoryResult;
    let categorizationSource;

    if (mlPrediction) {
      // ML prediction available — use it as primary
      categoryResult = {
        category: mlPrediction.category,
        confidence: Math.round(mlPrediction.confidence * 100),
        matchedKeywords: ['ml-predicted'],
      };
      categorizationSource = 'ml';
    } else {
      // ML service offline or failed — fallback to keyword rules
      categoryResult = categorizeExpense(parsedData.merchant, text);
      categorizationSource = 'keyword';
    }
    
    // Calculate overall confidence
    const overallConfidence = calculateConfidence(parsedData, ocrConfidence);

    // Create expense document
    const expense = new Expense({
      userId: req.user._id,
      merchant: parsedData.merchant || 'Unknown',
      date: parsedData.date || new Date().toLocaleDateString(),
      total: parsedData.total || 0,
      tax: parsedData.tax || 0,
      category: categoryResult.category,
      confidence: overallConfidence,
      categoryConfidence: categoryResult.confidence,
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
router.get('/', async (req, res) => {
  try {
    const { category, startDate, endDate, minAmount, maxAmount, year, sort = '-createdAt' } = req.query;
    
    const filter = { userId: req.user._id };
    
    if (category) {
      filter.category = category;
    }
    
    if (minAmount || maxAmount) {
      filter.total = {};
      if (minAmount) filter.total.$gte = parseFloat(minAmount);
      if (maxAmount) filter.total.$lte = parseFloat(maxAmount);
    }

    let expenses = await Expense.find(filter).sort(sort);
    
    // Filter by year if specified
    if (year && year !== 'all') {
      const selectedYear = parseInt(year);
      expenses = expenses.filter(expense => {
        return getExpenseYear(expense) === selectedYear;
      });
    }
    
    res.json({
      count: expenses.length,
      expenses
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Failed to fetch expenses', error: error.message });
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
router.put('/:id', async (req, res) => {
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

// Helper function to extract year from expense
const getExpenseYear = (expense) => {
  let dateObj;
  try {
    if (expense.date) {
      // Try to parse the date string
      dateObj = new Date(expense.date);
      // If invalid date, fall back to createdAt
      if (isNaN(dateObj.getTime())) {
        dateObj = new Date(expense.createdAt);
      }
    } else {
      dateObj = new Date(expense.createdAt);
    }
  } catch (e) {
    dateObj = new Date(expense.createdAt);
  }
  return dateObj.getFullYear();
};

// GET /api/expenses/dashboard/stats - Get dashboard quick stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort('-createdAt');
    
    // Calculate quick stats
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // This month's expenses
    const thisMonthExpenses = expenses.filter(expense => {
      let expDate;
      try {
        expDate = expense.date ? new Date(expense.date) : new Date(expense.createdAt);
        if (isNaN(expDate.getTime())) {
          expDate = new Date(expense.createdAt);
        }
      } catch (e) {
        expDate = new Date(expense.createdAt);
      }
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });
    
    const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + exp.total, 0);
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.total, 0);
    const lastExpense = expenses.length > 0 ? expenses[0] : null;
    
    res.json({
      totalExpenses: expenses.length,
      thisMonthTotal: thisMonthTotal.toFixed(2),
      totalSpent: totalSpent.toFixed(2),
      thisMonthCount: thisMonthExpenses.length,
      lastExpense: lastExpense ? {
        merchant: lastExpense.merchant,
        total: lastExpense.total,
        date: lastExpense.date,
        category: lastExpense.category
      } : null
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
    
    // Get all expenses for the user to extract available years
    const allExpenses = await Expense.find({ userId: req.user._id }).sort('-createdAt');
    
    // Extract unique years from expenses (based on bill date)
    const yearsSet = new Set();
    allExpenses.forEach(expense => {
      const expenseYear = getExpenseYear(expense);
      yearsSet.add(expenseYear);
    });
    const availableYears = Array.from(yearsSet).sort((a, b) => b - a);
    
    console.log('Available years from expenses:', availableYears);
    console.log('Selected year filter:', year);
    
    // Filter expenses by year if specified
    let expenses = allExpenses;
    if (year && year !== 'all') {
      const selectedYear = parseInt(year);
      expenses = allExpenses.filter(expense => {
        return getExpenseYear(expense) === selectedYear;
      });
      console.log(`Filtered to ${expenses.length} expenses for year ${selectedYear}`);
    } else {
      console.log(`Showing all ${expenses.length} expenses`);
    }
    
    // Category breakdown
    const categoryBreakdown = {};
    expenses.forEach(expense => {
      if (!categoryBreakdown[expense.category]) {
        categoryBreakdown[expense.category] = { total: 0, count: 0 };
      }
      categoryBreakdown[expense.category].total += expense.total;
      categoryBreakdown[expense.category].count += 1;
    });

    // Monthly spending based on bill date
    const monthlySpending = {};
    expenses.forEach(expense => {
      // Try to parse the date from the expense.date field
      let dateObj;
      try {
        // Handle various date formats
        if (expense.date) {
          dateObj = new Date(expense.date);
          // If invalid date, fall back to createdAt
          if (isNaN(dateObj.getTime())) {
            dateObj = new Date(expense.createdAt);
          }
        } else {
          dateObj = new Date(expense.createdAt);
        }
      } catch (e) {
        dateObj = new Date(expense.createdAt);
      }
      
      // Format: "MMM YYYY" (e.g., "Oct 2025")
      const month = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!monthlySpending[month]) {
        monthlySpending[month] = 0;
      }
      monthlySpending[month] += expense.total;
    });

    // Overall stats
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.total, 0);
    const averageExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;
    const totalTax = expenses.reduce((sum, exp) => sum + (exp.tax || 0), 0);

    // Sort monthly spending by date (chronological order)
    const sortedMonthlySpending = Object.fromEntries(
      Object.entries(monthlySpending).sort((a, b) => {
        // Parse month format "Oct 2025" to proper date for sorting
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA - dateB;
      })
    );

    res.json({
      categoryBreakdown,
      monthlySpending: sortedMonthlySpending,
      availableYears,
      stats: {
        totalExpenses: expenses.length,
        totalSpent: totalSpent.toFixed(2),
        averageExpense: averageExpense.toFixed(2),
        totalTax: totalTax.toFixed(2)
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
    let expenses = await Expense.find({ userId: req.user._id }).sort('-createdAt');
    
    // Filter by year if specified
    if (year && year !== 'all') {
      const selectedYear = parseInt(year);
      expenses = expenses.filter(expense => {
        return getExpenseYear(expense) === selectedYear;
      });
    }
    
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

export default router;
