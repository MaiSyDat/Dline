/**
 * Textarea Component
 * 
 * Component textarea tái sử dụng với styling nhất quán
 * Hỗ trợ label và error message
 */

import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label hiển thị phía trên textarea */
  label?: string;
  /** Error message hiển thị phía dưới textarea */
  error?: string;
  /** Full width textarea */
  fullWidth?: boolean;
}

/**
 * Textarea component với label và error handling
 */
export const Textarea: React.FC<TextareaProps> = ({
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
      <textarea
        className={`
          w-full px-4 py-2.5 border rounded text-sm
          bg-slate-50 focus:bg-white transition-all resize-none
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

