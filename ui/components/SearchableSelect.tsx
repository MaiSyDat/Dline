/**
 * SearchableSelect Component
 * 
 * Select dropdown với khả năng tìm kiếm
 * Cho phép nhập text để filter options
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

export interface SearchableSelectProps {
  /** Options để hiển thị */
  options: SearchableSelectOption[];
  /** Giá trị đã chọn */
  value: string;
  /** Callback khi thay đổi giá trị */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Label hiển thị phía trên */
  label?: string;
  /** Có required không */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Custom className */
  className?: string;
  /** Name attribute cho form */
  name?: string;
}

/**
 * SearchableSelect component với tìm kiếm
 */
export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  label,
  required = false,
  disabled = false,
  fullWidth = true,
  className = '',
  name
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected option label
  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption?.label || '';

  // Filter options based on search term
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        e.preventDefault();
        handleSelect(filteredOptions[focusedIndex].value);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, filteredOptions]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && dropdownRef.current) {
      const focusedElement = dropdownRef.current.children[focusedIndex] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchTerm('');
    setFocusedIndex(-1);
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setSearchTerm('');
      setFocusedIndex(-1);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className={`space-y-1 ${fullWidth ? 'w-full' : ''} ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Hidden input for form submission */}
        {name && (
          <input type="hidden" name={name} value={value} />
        )}

        {/* Main button/input */}
        <div
          onClick={handleToggle}
          className={`
            w-full px-4 py-2.5 border rounded text-sm
            bg-slate-50 focus:bg-white transition-all cursor-pointer
            flex items-center justify-between gap-2
            ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-accent'}
            ${isOpen ? 'border-accent ring-1 ring-accent' : 'border-slate-200'}
          `}
        >
          <span className={`flex-1 text-left truncate ${!displayValue ? 'text-slate-400' : 'text-slate-900'}`}>
            {displayValue || placeholder}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-slate-200 rounded transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-slate-400" />
              </button>
            )}
            <ChevronDownIcon 
              className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-hidden"
          >
            {/* Search input */}
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setFocusedIndex(-1);
                  }}
                  placeholder={placeholder}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Options list */}
            <div className="overflow-y-auto max-h-48 custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">
                  Không tìm thấy kết quả
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`
                      px-4 py-2.5 text-sm cursor-pointer transition-colors
                      ${value === option.value 
                        ? 'bg-accent/10 text-accent font-semibold' 
                        : 'text-slate-700 hover:bg-slate-50'
                      }
                      ${index === focusedIndex ? 'bg-slate-100' : ''}
                    `}
                  >
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

