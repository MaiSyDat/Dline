/**
 * Input Component
 * 
 * Component input tái sử dụng với styling nhất quán
 * Hỗ trợ label, error message và các input types
 */

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label hiển thị phía trên input */
  label?: string;
  /** Error message hiển thị phía dưới input */
  error?: string;
  /** Full width input */
  fullWidth?: boolean;
}

/**
 * Input component với label và error handling
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
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
      <input
        className={`
          w-full px-4 py-2.5 border rounded text-sm
          bg-slate-50 focus:bg-white transition-all
          ${error ? 'border-red-300 focus:border-red-500' : 'border-slate-200'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

