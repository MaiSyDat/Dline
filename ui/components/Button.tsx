/**
 * Button Component
 * 
 * Component button tái sử dụng với nhiều variant và size
 * Hỗ trợ loading state và disabled state
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variant màu sắc của button */
  variant?: 'primary' | 'accent' | 'danger' | 'success' | 'ghost';
  /** Kích thước button */
  size?: 'sm' | 'md' | 'lg';
  /** Hiển thị loading spinner */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
}

/**
 * Button component với nhiều tùy chọn styling
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  // Map variant sang Tailwind classes
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-slate-800',
    accent: 'bg-accent text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100'
  };

  // Map size sang Tailwind classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base'
  };

  return (
    <button
      className={`
        font-bold rounded transition-all
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Đang xử lý...' : children}
    </button>
  );
};

