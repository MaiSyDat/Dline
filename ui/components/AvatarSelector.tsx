/**
 * AvatarSelector Component
 * 
 * Component cho phép chọn avatar từ danh sách ảnh có sẵn
 */

'use client';

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

export interface AvatarSelectorProps {
  /** Avatar đã chọn (URL) */
  selectedAvatar?: string;
  /** Callback khi chọn avatar */
  onSelect: (avatarUrl: string) => void;
  /** Label hiển thị */
  label?: string;
}

/**
 * Danh sách avatar có sẵn trong public/img/avatar
 * Chỉ cho phép chọn từ các avatar mặc định (avatar1-5, 7-8)
 */
const AVATAR_OPTIONS = [
  '/img/avatar/avatar1.jpg',
  '/img/avatar/avatar2.jpg',
  '/img/avatar/avatar3.jpg',
  '/img/avatar/avatar4.jpg',
  '/img/avatar/avatar5.jpg',
  '/img/avatar/avatar7.jpg',
  '/img/avatar/avatar8.jpg',
];

/**
 * AvatarSelector component với grid ảnh để chọn
 */
export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar,
  onSelect,
  label = 'Chọn avatar'
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </label>
      )}
      <div className="grid grid-cols-4 gap-2">
        {AVATAR_OPTIONS.map((avatarUrl, index) => {
          const isSelected = selectedAvatar === avatarUrl;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(avatarUrl)}
              className={`
                relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                ${isSelected 
                  ? 'border-accent ring-2 ring-accent/20' 
                  : 'border-slate-200 hover:border-accent/50'
                }
              `}
            >
              <img 
                src={avatarUrl} 
                alt={`Avatar ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                  <CheckIcon className="w-6 h-6 text-white bg-accent rounded-full p-1" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {selectedAvatar && (
        <p className="text-xs text-slate-500 mt-2">
          Đã chọn: <span className="font-semibold">{selectedAvatar.split('/').pop()}</span>
        </p>
      )}
    </div>
  );
};

