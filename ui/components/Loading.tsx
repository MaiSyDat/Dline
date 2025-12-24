/**
 * Loading Component
 * 
 * Component hiển thị loading spinner và message
 * Sử dụng khi đang fetch data hoặc xử lý async operations
 */

import React from 'react';

export interface LoadingProps {
  /** Message hiển thị khi loading */
  message?: string;
  /** Error message nếu có */
  error?: string | null;
  /** Full screen loading */
  fullScreen?: boolean;
}

/**
 * Loading component với spinner và message
 */
export const Loading: React.FC<LoadingProps> = ({
  message = 'Đang tải dữ liệu...',
  error = null,
  fullScreen = false
}) => {
  const containerClasses = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-slate-900 text-white'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="text-center space-y-2">
        {/* Loading spinner */}
        <div className="w-12 h-12 mx-auto border-2 border-white/20 border-t-white rounded-full animate-spin" />
        
        {/* Loading message */}
        <p className="text-sm">{message}</p>
        
        {/* Error message nếu có */}
        {error && (
          <p className="text-red-300 text-xs">{error}</p>
        )}
      </div>
    </div>
  );
};

