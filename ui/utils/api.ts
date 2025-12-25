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
  try {
    const res = await fetch(url, options);
    
    // Kiểm tra content-type trước khi parse JSON
    const contentType = res.headers.get('content-type');
    let data: any;
    
    try {
      const text = await res.text();
      if (!text) {
        throw new Error('Empty response body');
      }
      data = JSON.parse(text);
    } catch (parseError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('JSON parse error:', parseError, 'Response:', res);
      }
      throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
    
    // Kiểm tra response status và error flag
    if (!res.ok || data?.ok === false) {
      const message = data?.error || data?.message || res.statusText || `HTTP ${res.status}`;
      const error = new Error(message);
      (error as any).status = res.status;
      if (process.env.NODE_ENV === 'development') {
        console.error('API error response:', { url, status: res.status, data });
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    // Re-throw nếu đã là Error với status
    if (error instanceof Error && (error as any).status) {
      throw error;
    }
    // Wrap network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    throw error;
  }
};

