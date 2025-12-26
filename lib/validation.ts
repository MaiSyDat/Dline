/**
 * Input Validation and Sanitization Utilities
 * 
 * Cung cấp các hàm validation và sanitization để bảo mật input từ user
 */

/**
 * Sanitize string input - loại bỏ các ký tự nguy hiểm
 */
export function sanitizeString(input: string, maxLength?: number): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  let sanitized = input.trim();
  
  // Loại bỏ các ký tự control và null bytes
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Giới hạn độ dài nếu có
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase().trim());
}

/**
 * Validate và normalize email
 */
export function normalizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }
  
  const normalized = email.toLowerCase().trim();
  if (!isValidEmail(normalized)) {
    return null;
  }
  
  return normalized;
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Mật khẩu không được để trống' };
  }
  
  if (password.length < 6) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }
  
  if (password.length > 128) {
    return { valid: false, message: 'Mật khẩu không được vượt quá 128 ký tự' };
  }
  
  return { valid: true };
}

/**
 * Validate UUID format
 */
export function isValidUUID(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validate date string (ISO format)
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Sanitize HTML - loại bỏ các thẻ HTML nguy hiểm
 * Chỉ cho phép text thuần túy
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Loại bỏ tất cả HTML tags
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Validate và sanitize URL
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    // Chỉ cho phép http và https
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate array of strings (for memberIds, etc.)
 */
export function isValidStringArray(arr: any, maxLength?: number): arr is string[] {
  if (!Array.isArray(arr)) {
    return false;
  }
  
  if (maxLength && arr.length > maxLength) {
    return false;
  }
  
  return arr.every(item => typeof item === 'string' && item.length > 0);
}

/**
 * Validate priority value
 */
export function isValidPriority(priority: string): boolean {
  return ['low', 'medium', 'high'].includes(priority.toLowerCase());
}

/**
 * Validate status value
 */
export function isValidStatus(status: string): boolean {
  return ['new', 'in_progress', 'done', 'bug'].includes(status.toLowerCase());
}

