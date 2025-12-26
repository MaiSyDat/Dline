/**
 * ConfirmModal Component
 * 
 * Modal xác nhận dùng chung với 2 nút: Có / Không
 * Thay thế cho confirm() và alert() của browser
 */

'use client';

import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export interface ConfirmModalProps {
  /** Hiển thị modal hay không */
  isOpen: boolean;
  /** Tiêu đề modal */
  title?: string;
  /** Nội dung thông báo */
  message: string;
  /** Loại modal: confirm (có 2 nút) hoặc alert (chỉ có 1 nút) */
  type?: 'confirm' | 'alert';
  /** Text nút xác nhận (mặc định: "Có") */
  confirmText?: string;
  /** Text nút hủy (mặc định: "Không") */
  cancelText?: string;
  /** Variant của nút xác nhận */
  confirmVariant?: 'primary' | 'danger' | 'warning';
  /** Callback khi click nút xác nhận */
  onConfirm: () => void;
  /** Callback khi click nút hủy hoặc đóng */
  onCancel: () => void;
}

/**
 * ConfirmModal component
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  type = 'confirm',
  confirmText = 'Có',
  cancelText = 'Không',
  confirmVariant = 'primary',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const variantClasses = {
    primary: 'bg-[#8907E6] text-white hover:bg-[#7A06D1]',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600'
  };

  return (
    <div
      className="fixed inset-0 z-[700] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={type === 'alert' ? onCancel : undefined}
    >
      <div
        className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              confirmVariant === 'danger' ? 'bg-red-100' : 
              confirmVariant === 'warning' ? 'bg-yellow-100' : 
              'bg-[#8907E6]/10'
            }`}>
              <ExclamationTriangleIcon className={`w-5 h-5 ${
                confirmVariant === 'danger' ? 'text-red-600' : 
                confirmVariant === 'warning' ? 'text-yellow-600' : 
                'text-[#8907E6]'
              }`} />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              {title || 'Xác nhận'}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          {type === 'confirm' && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${variantClasses[confirmVariant]}`}
          >
            {type === 'alert' ? 'Đóng' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

