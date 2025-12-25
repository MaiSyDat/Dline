/**
 * Authentication Utility Functions (DEPRECATED)
 * 
 * File này đã được thay thế bởi NextAuth v5
 * Giữ lại để backward compatibility nếu có code cũ còn sử dụng
 * 
 * @deprecated Sử dụng NextAuth session thay vì localStorage
 */

import { User } from '@/types';

const AUTH_STORAGE_KEY = 'dline_auth_user';

/**
 * @deprecated Sử dụng NextAuth session thay vì localStorage
 */
export const saveUser = (user: User): void => {
  // Deprecated - không làm gì cả
  console.warn('saveUser is deprecated. Use NextAuth session instead.');
};

/**
 * @deprecated Sử dụng NextAuth session thay vì localStorage
 */
export const getUser = (): User | null => {
  // Deprecated - không làm gì cả
  console.warn('getUser is deprecated. Use NextAuth session instead.');
  return null;
};

/**
 * @deprecated Sử dụng NextAuth signOut thay vì localStorage
 */
export const removeUser = (): void => {
  // Deprecated - không làm gì cả
  console.warn('removeUser is deprecated. Use NextAuth signOut instead.');
};

/**
 * @deprecated Sử dụng NextAuth session thay vì localStorage
 */
export const isAuthenticated = (): boolean => {
  // Deprecated - không làm gì cả
  console.warn('isAuthenticated is deprecated. Use NextAuth session instead.');
  return false;
};
