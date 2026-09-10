/**
 * Flat Design System Tokens for ExpenseTracker
 * Strict Light Mode Flat Palette - Zero Artificial Depth
 */

export const TOKENS = {
  colors: {
    background: '#FFFFFF',
    foreground: '#111827',
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    secondary: '#10B981',
    secondaryHover: '#059669',
    accent: '#F59E0B',
    accentHover: '#D97706',
    danger: '#EF4444',
    dangerHover: '#DC2626',
    muted: '#F3F4F6',
    mutedHover: '#E5E7EB',
    border: '#E5E7EB',
    borderBold: '#111827',
    
    // Tints for color-block cards
    tintBlue: '#EFF6FF',
    tintEmerald: '#ECFDF5',
    tintAmber: '#FFFBEB',
    tintRose: '#FEF2F2',
    tintPurple: '#FAF5FF',
    tintSlate: '#F8FAFC',
  },
  typography: {
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
    letterSpacingTight: '-0.02em',
  },
  radius: {
    none: '0px',
    md: '6px',
    lg: '8px',
    full: '9999px',
  },
  chartColors: [
    '#3B82F6', // Blue (Primary)
    '#10B981', // Emerald (Secondary)
    '#F59E0B', // Amber (Accent)
    '#EF4444', // Rose / Danger
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#64748B', // Slate
    '#111827', // Gray 900
  ],
  categoryColors: {
    'Food & Dining': { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
    'Groceries': { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
    'Transportation': { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' },
    'Shopping': { bg: '#FCE7F3', text: '#9D174D', border: '#EC4899' },
    'Entertainment': { bg: '#EDE9FE', text: '#5B21B6', border: '#8B5CF6' },
    'Healthcare': { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' },
    'Utilities': { bg: '#E0F2FE', text: '#075985', border: '#0284C7' },
    'Travel': { bg: '#CCFBF1', text: '#115E59', border: '#14B8A6' },
    'Education': { bg: '#E0E7FF', text: '#3730A3', border: '#6366F1' },
    'Personal Care': { bg: '#FFEDD5', text: '#9A3412', border: '#F97316' },
    'Insurance': { bg: '#E2E8F0', text: '#1E293B', border: '#64748B' },
    'Other': { bg: '#F3F4F6', text: '#111827', border: '#9CA3AF' },
  }
};
