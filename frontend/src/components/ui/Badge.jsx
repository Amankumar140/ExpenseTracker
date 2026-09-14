import React from 'react';
import { TOKENS } from '../../tokens';

/**
 * Flat Design System Badge
 * Pure flat color block. Amber backgrounds always use dark text (#111827).
 */
const Badge = ({
  children,
  category,
  variant = 'default', // 'default' | 'primary' | 'secondary' | 'accent' | 'danger'
  size = 'md',
  className = '',
}) => {
  if (category && TOKENS.categoryColors[category]) {
    const config = TOKENS.categoryColors[category];
    return (
      <span
        style={{ backgroundColor: config.bg, color: config.text }}
        className={`inline-flex items-center gap-1.5 font-bold rounded-md px-2.5 py-1 text-xs uppercase tracking-wider ${className}`}
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: config.border }}
        />
        {children || category}
      </span>
    );
  }

  const variantStyles = {
    default: 'bg-gray-100 text-gray-900',
    primary: 'bg-blue-100 text-blue-900',
    secondary: 'bg-emerald-100 text-emerald-900',
    accent: 'bg-amber-100 text-gray-900', // Rule 2: Amber always dark text #111827
    danger: 'bg-red-100 text-red-900',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-md uppercase tracking-wider ${
        variantStyles[variant] || variantStyles.default
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
