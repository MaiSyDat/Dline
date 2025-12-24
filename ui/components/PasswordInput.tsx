/**
 * PasswordInput Component
 * 
 * Component input password với icon mắt để toggle show/hide password
 */

'use client';

import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label hiển thị phía trên input */
  label?: string;
  /** Error message hiển thị phía dưới input */
  error?: string;
  /** Full width input */
  fullWidth?: boolean;
}

/**
 * PasswordInput component với toggle show/hide password
 */
export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  fullWidth = true,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`space-y-1 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className={`
            w-full px-4 py-2.5 pr-12 border rounded text-sm
            bg-slate-50 focus:bg-white transition-all
            ${error ? 'border-red-300 focus:border-red-500' : 'border-slate-200'}
            ${className}
          `}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
        >
          {showPassword ? (
            <EyeSlashIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

