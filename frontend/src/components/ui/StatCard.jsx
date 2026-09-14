import React from 'react';

/**
 * Flat Design System StatCard
 * Color-block cards using tints (blue-50, emerald-50, amber-50, rose-50)
 * Bold stat numbers in matching accent colors, icon inside solid white circle.
 */
const StatCard = ({
  label,
  value,
  icon: Icon,
  variant = 'blue', // 'blue' | 'emerald' | 'amber' | 'rose'
  subtitle,
  isLoading = false,
  className = '',
}) => {
  const configs = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      iconText: 'text-blue-500',
      badgeBg: 'bg-blue-100 text-blue-900',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      iconText: 'text-emerald-500',
      badgeBg: 'bg-emerald-100 text-emerald-900',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      iconText: 'text-amber-500',
      badgeBg: 'bg-amber-100 text-gray-900', // WCAG AA dark text
    },
    rose: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      iconText: 'text-red-500',
      badgeBg: 'bg-red-100 text-red-900',
    },
  };

  const current = configs[variant] || configs.blue;

  return (
    <div
      className={`rounded-lg p-6 sm:p-7 transition-all duration-200 hover:scale-[1.02] shadow-none border-0 ${current.bg} ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
          {label}
        </span>
        {Icon && (
          <div className={`w-12 h-12 bg-white rounded-full flex items-center justify-center ${current.iconText} shadow-none`}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
        )}
      </div>

      <div className="space-y-1">
        {isLoading ? (
          <div className="h-9 w-28 bg-gray-200 animate-pulse rounded-md"></div>
        ) : (
          <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${current.text}`}>
            {value}
          </div>
        )}
        {subtitle && (
          <p className="text-xs font-medium text-gray-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
