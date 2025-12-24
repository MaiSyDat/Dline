/**
 * Badge Component
 * 
 * Component badge hiển thị status, priority, hoặc label
 * Hỗ trợ nhiều variant màu sắc
 */

import React from 'react';

export interface BadgeProps {
  /** Nội dung hiển thị trong badge */
  children: React.ReactNode;
  /** Variant màu sắc */
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  /** Kích thước badge */
  size?: 'sm' | 'md';
  /** Custom className */
  className?: string;
}

/**
 * Badge component để hiển thị status, tags, labels
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = ''
}) => {
  // Map variant sang Tailwind classes
  const variantClasses = {
    default: 'bg-slate-50 text-slate-500 border-slate-100',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    danger: 'bg-red-50 text-red-500 border-red-100',
    warning: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    info: 'bg-blue-50 text-blue-600 border-blue-100'
  };

  // Map size sang Tailwind classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[9px]',
    md: 'px-3 py-1 text-xs'
  };

  return (
    <span
      className={`
        rounded border font-black uppercase tracking-wider
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

