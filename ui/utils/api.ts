/**
 * API Utility Functions
 * 
 * Cung cấp các hàm tiện ích để gọi API một cách an toàn và nhất quán
 * Xử lý lỗi và normalize response từ server
 */

/**
 * Gọi API và parse JSON response
 * @param url - Đường dẫn API endpoint
 * @param options - Tùy chọn fetch (method, headers, body, etc.)
 * @returns Promise với data đã parse
 * @throws Error nếu request thất bại hoặc response không ok
 */
export const fetchJson = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(url, options);
  const data = await res.json();
  
  // Kiểm tra response status và error flag
  if (!res.ok || data?.ok === false) {
    const message = data?.error || res.statusText;
    throw new Error(message);
  }
  
  return data;
};

