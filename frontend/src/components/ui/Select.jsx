import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

/**
 * Flat Design System Select
 */
const Select = ({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  children,
  error,
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
        <select
          id={id || name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full appearance-none rounded-md text-sm text-gray-900 transition-colors duration-200 shadow-none outline-none pl-4 pr-10 py-2.5 sm:py-3 cursor-pointer ${
            error
              ? 'bg-red-50/50 border-2 border-red-500 focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
              : 'bg-gray-100 border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
          {...props}
        >
          {children || options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-500">
          <ChevronDown size={18} strokeWidth={2.5} />
        </div>
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

export default Select;
