/**
 * Select Component
 * 
 * Component select dropdown tái sử dụng với styling nhất quán
 * Hỗ trợ label và error message
 */

import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Label hiển thị phía trên select */
  label?: string;
  /** Error message hiển thị phía dưới select */
  error?: string;
  /** Options cho select */
  options: Array<{ value: string; label: string }>;
  /** Full width select */
  fullWidth?: boolean;
}

/**
 * Select component với label và error handling
 */
export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  fullWidth = true,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-1 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-2.5 border rounded text-sm
          bg-slate-50 focus:bg-white transition-all
          ${error ? 'border-red-300 focus:border-red-500' : 'border-slate-200'}
          ${className}
        `}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

