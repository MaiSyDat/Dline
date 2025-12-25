/**
 * Permission utilities
 * 
 * Helper functions để kiểm tra quyền của user
 * Admin và Manager có quyền giống nhau
 */

import { UserRole } from '@/types';

/**
 * Kiểm tra xem user có quyền admin hoặc manager không
 * Admin và Manager có quyền giống nhau
 */
export function isAdminOrManager(role: UserRole | string | undefined): boolean {
  return role === UserRole.ADMIN || role === UserRole.MANAGER;
}

/**
 * Kiểm tra xem user có phải admin không
 */
export function isAdmin(role: UserRole | string | undefined): boolean {
  return role === UserRole.ADMIN;
}

/**
 * Kiểm tra xem user có phải manager không
 */
export function isManager(role: UserRole | string | undefined): boolean {
  return role === UserRole.MANAGER;
}

/**
 * Kiểm tra xem manager có thể xóa user với role này không
 * Manager không thể xóa Admin
 */
export function canManagerDeleteUser(managerRole: UserRole | string | undefined, targetUserRole: UserRole | string | undefined): boolean {
  if (managerRole !== UserRole.MANAGER) {
    return true; // Admin có thể xóa bất kỳ ai
  }
  // Manager không thể xóa Admin
  return targetUserRole !== UserRole.ADMIN;
}

