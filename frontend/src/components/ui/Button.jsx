import React from 'react';

/**
 * Flat Design System Button
 * Features: High contrast, 0px shadow, hover scale-105 feedback, bold touch targets.
 */
const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size = 'md',         // 'cta' | 'md' | 'sm' | 'icon'
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none';

  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 active:scale-95 shadow-none border-0',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 hover:scale-105 active:scale-95 shadow-none border-0',
    outline: 'border-4 border-blue-500 text-blue-500 bg-transparent hover:bg-blue-500 hover:text-white hover:scale-105 active:scale-95 shadow-none',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:scale-105 active:scale-95 shadow-none border-0',
    ghost: 'bg-transparent text-gray-900 hover:bg-gray-100 shadow-none border-0',
  };

  const sizes = {
    cta: 'h-14 sm:h-16 px-8 text-base sm:text-lg tracking-wide',
    md: 'h-10 sm:h-11 px-5 text-sm',
    sm: 'h-9 px-3.5 text-xs',
    icon: 'h-10 w-10 p-0',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
