import express from 'express';
import Expense from '../models/Expense.js';
import upload from '../middleware/upload.js';
import { performOCR, parseExpenseData, calculateConfidence } from '../services/ocrService.js';
import { categorizeExpense, manualCategorize } from '../services/categorizationService.js';
import { Parser } from 'json2csv';

const router = express.Router();

// POST /api/expenses/upload - Upload and process receipt
router.post('/upload', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Perform OCR
    const { text, confidence: ocrConfidence } = await performOCR(req.file.path);
    
    // Parse expense data
    const parsedData = parseExpenseData(text);
    
    // Categorize expense
    const categoryResult = categorizeExpense(parsedData.merchant, text);
    
    // Calculate overall confidence
    const overallConfidence = calculateConfidence(parsedData, ocrConfidence);

    // Create expense document
    const expense = new Expense({
      merchant: parsedData.merchant || 'Unknown',
      date: parsedData.date || new Date().toLocaleDateString(),
      total: parsedData.total || 0,
      tax: parsedData.tax || 0,
      category: categoryResult.category,
      confidence: overallConfidence,
      categoryConfidence: categoryResult.confidence,
      matchedKeywords: categoryResult.matchedKeywords,
      imagePath: `/uploads/${req.file.filename}`,
      rawText: text
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
    const { category, startDate, endDate, minAmount, maxAmount, sort = '-createdAt' } = req.query;
    
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (minAmount || maxAmount) {
      filter.total = {};
      if (minAmount) filter.total.$gte = parseFloat(minAmount);
      if (maxAmount) filter.total.$lte = parseFloat(maxAmount);
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

// GET /api/expenses/:id - Get single expense
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
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
    
    const expense = await Expense.findById(req.params.id);
    
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
    const expense = await Expense.findByIdAndDelete(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Failed to delete expense', error: error.message });
  }
});

// GET /api/expenses/analytics/summary - Get analytics data
router.get('/analytics/summary', async (req, res) => {
  try {
    const expenses = await Expense.find();
    
    // Category breakdown
    const categoryBreakdown = {};
    expenses.forEach(expense => {
      if (!categoryBreakdown[expense.category]) {
        categoryBreakdown[expense.category] = { total: 0, count: 0 };
      }
      categoryBreakdown[expense.category].total += expense.total;
      categoryBreakdown[expense.category].count += 1;
    });

    // Monthly spending
    const monthlySpending = {};
    expenses.forEach(expense => {
      const month = new Date(expense.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!monthlySpending[month]) {
        monthlySpending[month] = 0;
      }
      monthlySpending[month] += expense.total;
    });

    // Overall stats
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.total, 0);
    const averageExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;
    const totalTax = expenses.reduce((sum, exp) => sum + (exp.tax || 0), 0);

    res.json({
      categoryBreakdown,
      monthlySpending,
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
    const expenses = await Expense.find().sort('-createdAt');
    
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
