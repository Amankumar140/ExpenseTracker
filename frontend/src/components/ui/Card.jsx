import React from 'react';

/**
 * Flat Design System Card
 * Solid color block, 0px shadow, 0px border, rounded-lg (8px).
 * Optional scale-[1.02] feedback for summary or feature cards.
 */
const Card = ({
  children,
  color = 'white', // 'white' | 'muted' | 'blue' | 'emerald' | 'amber' | 'rose' | 'dark'
  interactive = false,
  padding = 'default', // 'none' | 'sm' | 'default' | 'lg'
  className = '',
  onClick,
  ...props
}) => {
  const colorMap = {
    white: 'bg-white text-gray-900',
    muted: 'bg-gray-100 text-gray-900',
    blue: 'bg-blue-50 text-gray-900',
    emerald: 'bg-emerald-50 text-gray-900',
    amber: 'bg-amber-50 text-gray-900',
    rose: 'bg-red-50 text-gray-900',
    dark: 'bg-gray-900 text-white',
  };

  const paddingMap = {
    none: 'p-0',
    sm: 'p-4 sm:p-5',
    default: 'p-6 sm:p-8',
    lg: 'p-8 sm:p-10',
  };

  const interactiveStyles = interactive
    ? 'group cursor-pointer transition-all duration-200 hover:scale-[1.02]'
    : '';

  return (
    <div
      onClick={onClick}
      className={`rounded-lg shadow-none border-0 ${colorMap[color] || colorMap.white} ${paddingMap[padding] || paddingMap.default} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
