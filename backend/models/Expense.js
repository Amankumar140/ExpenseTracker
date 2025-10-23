import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  merchant: {
    type: String,
    required: false,
    trim: true
  },
  date: {
    type: String,
    required: false
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Food & Dining',
      'Groceries',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Healthcare',
      'Utilities',
      'Travel',
      'Education',
      'Personal Care',
      'Insurance',
      'Other'
    ],
    default: 'Other'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  imagePath: {
    type: String,
    required: true
  },
  rawText: {
    type: String,
    default: ''
  },
  categoryConfidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  matchedKeywords: {
    type: [String],
    default: []
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
expenseSchema.index({ category: 1, createdAt: -1 });
expenseSchema.index({ createdAt: -1 });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
