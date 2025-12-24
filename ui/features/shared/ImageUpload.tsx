/**
 * ImageUpload Component
 * 
 * Component cho phép upload và preview nhiều images
 * Hỗ trợ drag & drop, preview, và xóa images
 */

'use client';

import React, { useState } from 'react';
import { PlusIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

export interface ImageUploadProps {
  /** Danh sách URLs của images đã upload */
  images: string[];
  /** Callback khi thay đổi images */
  onChange: (images: string[]) => void;
  /** Label hiển thị */
  label?: string;
  /** Số lượng images tối đa */
  maxImages?: number;
}

/**
 * ImageUpload component với preview và delete
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  label = 'Đính kèm ảnh',
  maxImages = 10
}) => {
  // Xử lý file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Convert files sang base64 URLs
    const readers = Array.from(files).slice(0, maxImages - images.length).map((file: File) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((results) => {
      onChange([...images, ...results]);
    });
  };

  // Xóa một image
  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <PhotoIcon className="w-4 h-4" />
        {label} ({images.length})
      </label>

      {/* Image previews và upload button */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* Preview images */}
        {images.map((img, i) => (
          <div
            key={i}
            className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden border border-slate-200"
          >
            <img src={img} className="w-full h-full object-cover" alt={`Upload ${i + 1}`} />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Upload button */}
        {images.length < maxImages && (
          <label className="w-20 h-20 shrink-0 border-2 border-dashed border-slate-200 rounded-md flex flex-col items-center justify-center text-slate-300 hover:text-accent hover:border-accent cursor-pointer transition-colors">
            <PlusIcon className="w-5 h-5" />
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
    </div>
  );
};

