/**
 * Authentication Utility Functions
 * 
 * Quản lý authentication state với localStorage
 * Lưu và khôi phục thông tin user đã đăng nhập
 */

import { User } from '@/types';

const AUTH_STORAGE_KEY = 'dline_auth_user';

/**
 * Lưu user vào localStorage
 * @param user - User object cần lưu
 */
export const saveUser = (user: User): void => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user to localStorage:', error);
  }
};

/**
 * Lấy user từ localStorage
 * @returns User object hoặc null nếu không có
 */
export const getUser = (): User | null => {
  try {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as User;
  } catch (error) {
    console.error('Failed to get user from localStorage:', error);
    return null;
  }
};

/**
 * Xóa user khỏi localStorage (logout)
 */
export const removeUser = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to remove user from localStorage:', error);
  }
};

/**
 * Kiểm tra xem có user đã đăng nhập không
 * @returns true nếu có user, false nếu không
 */
export const isAuthenticated = (): boolean => {
  return getUser() !== null;
};

