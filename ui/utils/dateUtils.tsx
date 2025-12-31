/**
 * Date utility functions
 */

/**
 * Format date to Vietnamese locale, return fallback text if invalid
 */
export const formatDate = (date: string | Date | null | undefined, fallback: string = 'Chưa có'): string => {
  if (!date) return fallback;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    
    return dateObj.toLocaleDateString('vi-VN');
  } catch {
    return fallback;
  }
};

/**
 * Format date with time to Vietnamese locale
 */
export const formatDateTime = (date: string | Date | null | undefined, fallback: string = 'Chưa có'): string => {
  if (!date) return fallback;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    
    return dateObj.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return fallback;
  }
};

/**
 * Format date to short format (dd/mm)
 */
export const formatDateShort = (date: string | Date | null | undefined, fallback: string = 'Chưa có'): string => {
  if (!date) return fallback;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    
    return dateObj.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit'
    });
  } catch {
    return fallback;
  }
};

