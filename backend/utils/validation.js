import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }
  };
};

const numericPreprocess = (val) => {
  if (val === undefined || val === null || val === '') return undefined;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? val : parsed;
};

export const updateExpenseSchema = z.object({
  merchant: z.string().trim().optional(),
  date: z.preprocess(
    (val) => (val ? new Date(val) : undefined),
    z.date({ invalid_type_error: 'Invalid date format' }).optional()
  ),
  total: z.preprocess(
    numericPreprocess,
    z.number({ invalid_type_error: 'Total must be a number' }).nonnegative('Total must be non-negative').optional()
  ),
  tax: z.preprocess(
    numericPreprocess,
    z.number({ invalid_type_error: 'Tax must be a number' }).nonnegative('Tax must be non-negative').optional()
  ),
  category: z.enum([
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
  ], { errorMap: () => ({ message: 'Invalid category name' }) }).optional(),
  notes: z.string().trim().optional(),
});

export const queryExpenseSchema = z.object({
  category: z.string().optional(),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid startDate format').optional(),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid endDate format').optional(),
  minAmount: z.preprocess(
    (val) => (val ? parseFloat(val) : undefined),
    z.number({ invalid_type_error: 'minAmount must be a number' }).nonnegative('minAmount must be non-negative').optional()
  ),
  maxAmount: z.preprocess(
    (val) => (val ? parseFloat(val) : undefined),
    z.number({ invalid_type_error: 'maxAmount must be a number' }).nonnegative('maxAmount must be non-negative').optional()
  ),
  year: z.string().optional(),
  sort: z.string().optional(),
});

export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }
  };
};
