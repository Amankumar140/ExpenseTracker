import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Flat Design System Input
 * Normal: Gray 100 bg, rounded-md, no border.
 * Focus: White bg, border-2 solid Primary (#3B82F6), no blur/glow.
 * Error: border-2 solid Rose/Red (#EF4444) + icon + message text.
 */
const Input = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  required = false,
  disabled = false,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label htmlFor={id || name} className="block text-sm font-semibold text-gray-900 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
        <input
          id={id || name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full rounded-md text-sm text-gray-900 transition-colors duration-200 shadow-none outline-none focus:outline-none ${
            Icon ? 'pl-10 pr-4' : 'px-4'
          } py-2.5 sm:py-3 ${
            error
              ? 'bg-red-50/50 border-2 border-red-500 focus:bg-white focus:border-red-600 focus:ring-0'
              : 'bg-gray-100 border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-red-600">
          <AlertCircle size={14} strokeWidth={2.5} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default Input;
