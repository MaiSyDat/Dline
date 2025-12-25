/**
 * LogoutButton Component
 * 
 * Button để đăng xuất sử dụng NextAuth signOut
 */

'use client';

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export interface LogoutButtonProps {
  /** Variant của button */
  variant?: 'icon' | 'text' | 'full';
  /** Custom className */
  className?: string;
}

/**
 * LogoutButton component với NextAuth signOut
 */
export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'icon',
  className = ''
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: false });
      router.refresh(); // Reload để cập nhật session
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Icon only variant
  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`p-2 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50 ${className}`}
        aria-label="Đăng xuất"
      >
        <ArrowRightOnRectangleIcon className="w-5 h-5" />
      </button>
    );
  }

  // Text variant
  if (variant === 'text') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50 ${className}`}
      >
        {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
      </button>
    );
  }

  // Full variant với icon và text
  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50 ${className}`}
    >
      <ArrowRightOnRectangleIcon className="w-5 h-5" />
      <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
    </button>
  );
};

