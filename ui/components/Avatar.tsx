/**
 * Avatar Component
 * 
 * Component hiển thị avatar của user
 * Hỗ trợ nhiều kích thước và fallback
 */

import React from 'react';

export interface AvatarProps {
  /** URL của avatar image */
  src: string;
  /** Tên user (dùng cho fallback) */
  name?: string;
  /** Kích thước avatar */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Border cho avatar */
  bordered?: boolean;
  /** Custom className */
  className?: string;
  /** Alt text cho image */
  alt?: string;
}

/**
 * Avatar component với nhiều kích thước
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  bordered = false,
  className = '',
  alt = ''
}) => {
  // Map size sang Tailwind classes
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20'
  };

  // Normalize src - nếu là URL ui-avatars.com và có name, có thể dùng local avatar
  const normalizedSrc = src || (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F172A&color=fff` : '');

  return (
    <img
      src={normalizedSrc}
      alt={alt || name || 'Avatar'}
      className={`
        rounded-full object-cover
        ${sizeClasses[size]}
        ${bordered ? 'border-2 border-slate-200 shadow-sm' : ''}
        ${className}
      `}
      onError={(e) => {
        // Fallback nếu image load lỗi - chỉ fallback nếu chưa phải là ui-avatars
        const target = e.target as HTMLImageElement;
        if (!target.src.includes('ui-avatars.com')) {
          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=0F172A&color=fff`;
        }
      }}
    />
  );
};

