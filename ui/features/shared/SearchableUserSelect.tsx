/**
 * SearchableUserSelect Component
 * 
 * Component cho phép tìm kiếm và chọn nhiều users
 * Hỗ trợ search, multi-select, và hiển thị selected users
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { User } from '@/types';
import { Avatar } from '../../components/Avatar';

export interface SearchableUserSelectProps {
  /** Danh sách users để chọn */
  users: User[];
  /** Danh sách IDs đã được chọn */
  selectedIds: string[];
  /** Callback khi thay đổi selection */
  onChange: (ids: string[]) => void;
  /** Label hiển thị */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * SearchableUserSelect component với search và multi-select
 */
export const SearchableUserSelect: React.FC<SearchableUserSelectProps> = ({
  users,
  selectedIds,
  onChange,
  label = 'Chọn nhân sự',
  placeholder = 'Tìm kiếm & Chọn nhân sự...'
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lọc users theo query
  const filtered = users.filter((u: User) =>
    u.name.toLowerCase().includes(query.toLowerCase())
  );

  // Toggle selection của một user
  const toggleUser = (userId: string) => {
    if (selectedIds.includes(userId)) {
      onChange(selectedIds.filter((id: string) => id !== userId));
    } else {
      onChange([...selectedIds, userId]);
    }
  };

  // Xóa một user khỏi selection
  const removeUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((id: string) => id !== userId));
  };

  return (
    <div className="relative space-y-1" ref={containerRef}>
      {/* Label */}
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
          {label}
        </label>
      )}

      {/* Input container với selected users */}
      <div
        className="w-full min-h-[42px] p-1.5 border border-slate-200 rounded-md bg-white flex flex-wrap gap-1.5 cursor-pointer hover:border-[#8907E6] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedIds.length === 0 && (
          <span className="text-slate-400 text-sm py-1 px-2">{placeholder}</span>
        )}
        
        {/* Hiển thị selected users */}
        {selectedIds.map((id: string) => {
          const user = users.find((u: User) => u.id === id);
          if (!user) return null;
          
          return (
            <div
              key={id}
              className="bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1.5 text-xs font-bold"
            >
              <Avatar src={user.avatar} name={user.name} size="sm" />
              {user.name}
              <XMarkIcon
                className="w-3 h-3 cursor-pointer hover:text-red-500"
                onClick={(e) => removeUser(id, e)}
              />
            </div>
          );
        })}
      </div>

      {/* Dropdown với search và user list */}
      {isOpen && (
        <div className="absolute z-[250] top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-2xl max-h-60 overflow-y-auto custom-scrollbar modal-enter">
          {/* Search input */}
          <div className="p-2 sticky top-0 bg-white border-b border-slate-100">
            <input
              autoFocus
              className="w-full px-3 py-2 text-sm border-none focus:ring-0"
              placeholder="Nhập tên..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* User list */}
          {filtered.map((u: User) => (
            <div
              key={u.id}
              className={`
                p-3 text-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50
                ${selectedIds.includes(u.id) ? 'bg-[#8907E6]/10 text-[#8907E6]' : ''}
              `}
              onClick={(e) => {
                e.stopPropagation();
                toggleUser(u.id);
              }}
            >
              <Avatar src={u.avatar} name={u.name} size="md" />
              <div className="flex-1 font-medium">{u.name}</div>
              {selectedIds.includes(u.id) && <CheckIcon className="w-4 h-4" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

