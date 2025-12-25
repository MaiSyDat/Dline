/**
 * Header Component
 * 
 * Header bar chứa title, search, và action buttons
 * Responsive với mobile và desktop
 */

'use client';

import React from 'react';
import {
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  FolderPlusIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { Project, UserRole } from '@/types';

export interface HeaderProps {
  /** Tab đang active */
  activeTab: 'dashboard' | 'projects' | 'tasks' | 'team';
  /** Project đang được chọn */
  selectedProjectId: string | null;
  /** Danh sách projects để tìm project name */
  projects: Project[];
  /** Role của user hiện tại */
  currentUserRole?: UserRole | string;
  /** Callback khi click back button */
  onBack?: () => void;
  /** Callback khi click create project */
  onCreateProject?: () => void;
  /** Callback khi click create user */
  onCreateUser?: () => void;
  /** Callback khi click create task */
  onCreateTask?: () => void;
}

/**
 * Header component với title, search, và actions
 */
export const Header: React.FC<HeaderProps> = ({
  activeTab,
  selectedProjectId,
  projects,
  currentUserRole,
  onBack,
  onCreateProject,
  onCreateUser,
  onCreateTask
}) => {
  // Admin và Manager có quyền giống nhau
  const canManageUsers = currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.MANAGER;
  // Lấy title dựa trên activeTab hoặc selectedProject
  const getTitle = () => {
    if (selectedProjectId) {
      const project = projects.find((p) => p.id === selectedProjectId);
      return project?.name || 'Dự án';
    }
    // Map tab names sang tiếng Việt
    const tabLabels: Record<typeof activeTab, string> = {
      dashboard: 'Tổng quan',
      projects: 'Dự án',
      tasks: 'Công việc',
      team: 'Nhân sự'
    };
    return tabLabels[activeTab] || activeTab;
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-10 shrink-0 shadow-sm">
      {/* Left side: Back button và title */}
      <div className="flex items-center gap-3">
        {selectedProjectId && onBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors"
            aria-label="Quay lại"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-[0.2em]">
          {getTitle()}
        </h2>
      </div>

      {/* Right side: Search và action buttons */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Search input */}
        <div className="relative group hidden sm:block">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#8907E6] transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="bg-slate-100 border-none rounded-md pl-9 pr-4 py-2 text-xs w-32 md:w-72 focus:w-40 md:focus:w-72 focus:bg-white focus:ring-1 focus:ring-[#8907E6] transition-all"
          />
        </div>

        {/* Action buttons dựa trên activeTab */}
        {activeTab === 'projects' && onCreateProject && (
          <button
            onClick={onCreateProject}
            className="bg-[#8907E6] text-white p-2 md:px-4 md:py-2 rounded md:rounded-md text-xs font-bold flex items-center gap-2 hover:bg-[#7A06D1] transition-all shadow-sm"
          >
            <FolderPlusIcon className="w-5 h-5 md:w-4 md:h-4" />
            <span className="hidden md:inline">Dự án mới</span>
          </button>
        )}

        {activeTab === 'team' && onCreateUser && canManageUsers && (
          <button
            onClick={onCreateUser}
            className="bg-[#8907E6] text-white p-2 md:px-4 md:py-2 rounded md:rounded-md text-xs font-bold flex items-center gap-2 hover:bg-[#7A06D1] transition-all shadow-sm"
          >
            <PlusIcon className="w-5 h-5 md:w-4 md:h-4" />
            <span className="hidden md:inline">Nhân sự mới</span>
          </button>
        )}

        {(activeTab === 'tasks' || selectedProjectId) && onCreateTask && (
          <button
            onClick={onCreateTask}
            className="bg-[#FF33E7] text-white p-2 md:px-4 md:py-2 rounded md:rounded-md text-xs font-bold flex items-center gap-2 hover:bg-[#E62DD1] shadow-sm active:scale-95 transition-all"
          >
            <PlusIcon className="w-5 h-5 md:w-4 md:h-4" />
            <span className="hidden md:inline">Giao việc mới</span>
          </button>
        )}
      </div>
    </header>
  );
};

