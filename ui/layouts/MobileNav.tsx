/**
 * MobileNav Component
 * 
 * Bottom navigation bar cho mobile devices
 * Hiển thị các tab chính với icons và labels
 */

'use client';

import React from 'react';
import {
  HomeIcon,
  BriefcaseIcon,
  Squares2X2Icon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export interface MobileNavProps {
  /** Tab đang active */
  activeTab: 'dashboard' | 'projects' | 'tasks' | 'team';
  /** Callback khi click tab */
  onTabChange: (tab: 'dashboard' | 'projects' | 'tasks' | 'team') => void;
  /** Callback khi click để clear selected project */
  onClearSelection?: () => void;
}

/**
 * MobileNav component với bottom navigation
 */
export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  onClearSelection
}) => {
  // Handle tab click
  const handleTabClick = (tab: 'dashboard' | 'projects' | 'tasks' | 'team') => {
    onTabChange(tab);
    if (onClearSelection) {
      onClearSelection();
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-2 z-40">
      {/* Dashboard tab */}
      <button
        onClick={() => handleTabClick('dashboard')}
        className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
          activeTab === 'dashboard' ? 'text-accent' : 'text-slate-400'
        }`}
      >
        <HomeIcon className="w-6 h-6" />
        <span className="text-[9px] font-bold uppercase tracking-tighter">Tổng quan</span>
      </button>

      {/* Projects tab */}
      <button
        onClick={() => handleTabClick('projects')}
        className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
          activeTab === 'projects' ? 'text-accent' : 'text-slate-400'
        }`}
      >
        <BriefcaseIcon className="w-6 h-6" />
        <span className="text-[9px] font-bold uppercase tracking-tighter">Dự án</span>
      </button>

      {/* Tasks tab */}
      <button
        onClick={() => handleTabClick('tasks')}
        className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
          activeTab === 'tasks' ? 'text-accent' : 'text-slate-400'
        }`}
      >
        <Squares2X2Icon className="w-6 h-6" />
        <span className="text-[9px] font-bold uppercase tracking-tighter">Công việc</span>
      </button>

      {/* Team tab */}
      <button
        onClick={() => handleTabClick('team')}
        className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
          activeTab === 'team' ? 'text-accent' : 'text-slate-400'
        }`}
      >
        <UserGroupIcon className="w-6 h-6" />
        <span className="text-[9px] font-bold uppercase tracking-tighter">Nhân sự</span>
      </button>
    </nav>
  );
};

