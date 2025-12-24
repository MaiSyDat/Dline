/**
 * Lightbox Component
 * 
 * Component hiển thị full-screen image viewer
 * Hỗ trợ navigation giữa các images và close
 */

'use client';

import React from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export interface LightboxProps {
  /** Danh sách URLs của images */
  images: string[];
  /** Index của image hiện tại */
  currentIndex: number;
  /** Callback khi đóng lightbox */
  onClose: () => void;
  /** Callback khi thay đổi index */
  onIndexChange: (index: number) => void;
}

/**
 * Lightbox component với navigation
 */
export const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  onClose,
  onIndexChange
}) => {
  // Navigate to previous image
  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onIndexChange(newIndex);
  };

  // Navigate to next image
  const goToNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onIndexChange(newIndex);
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length]);

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-8 md:right-8 z-[610] p-2 md:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
        aria-label="Đóng"
      >
        <XMarkIcon className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          onClick={goToPrevious}
          className="absolute left-2 md:left-8 p-3 md:p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all"
          aria-label="Ảnh trước"
        >
          <ChevronLeftIcon className="w-8 h-8 md:w-10 md:h-10" />
        </button>
      )}

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={goToNext}
          className="absolute right-2 md:right-8 p-3 md:p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all"
          aria-label="Ảnh sau"
        >
          <ChevronRightIcon className="w-8 h-8 md:w-10 md:h-10" />
        </button>
      )}

      {/* Image container */}
      <div className="relative max-w-[95vw] md:max-w-[85vw] max-h-[85vh] select-none">
        <img
          src={images[currentIndex]}
          className="w-full h-full object-contain shadow-2xl animate-in zoom-in-90 duration-300"
          alt={`Image ${currentIndex + 1}`}
        />
        
        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute -bottom-10 md:-bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/60 font-black text-[10px] md:text-xs uppercase tracking-widest">
            <span>{currentIndex + 1}</span>
            <div className="w-6 md:w-8 h-[1px] bg-white/20"></div>
            <span>{images.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};

