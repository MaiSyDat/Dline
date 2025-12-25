/**
 * Modal Component
 * 
 * Component modal tái sử dụng với backdrop và animation
 * Hỗ trợ close on backdrop click và custom header/footer
 */

import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface ModalProps {
  /** Hiển thị modal hay không */
  isOpen: boolean;
  /** Callback khi đóng modal */
  onClose: () => void;
  /** Tiêu đề modal */
  title?: string;
  /** Nội dung modal */
  children: React.ReactNode;
  /** Header color variant */
  headerVariant?: 'primary' | 'accent';
  /** Kích thước modal */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Không đóng khi click backdrop */
  preventBackdropClose?: boolean;
}

/**
 * Modal component với backdrop và animation
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  headerVariant = 'primary',
  size = 'md',
  preventBackdropClose = false
}) => {
  // Đóng modal khi nhấn ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Map size sang Tailwind classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  // Map header variant sang Tailwind classes
  const headerClasses = {
    primary: 'bg-[#8907E6] text-white',
    accent: 'bg-[#FF33E7] text-white'
  };

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={() => !preventBackdropClose && onClose()}
    >
      <div
        className={`
          bg-white w-full rounded-lg shadow-2xl overflow-hidden
          modal-enter max-h-[90vh] flex flex-col
          ${sizeClasses[size]}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className={`px-6 py-4 flex justify-between items-center shrink-0 ${headerClasses[headerVariant]}`}>
            <h3 className="text-xs font-black uppercase tracking-widest">{title}</h3>
            <button
              onClick={onClose}
              className="hover:opacity-80 transition-opacity"
              aria-label="Đóng modal"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

