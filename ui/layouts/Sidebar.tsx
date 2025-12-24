/**
 * Sidebar Component
 * 
 * Sidebar navigation chính của ứng dụng
 * Hiển thị menu items, project list, và user profile
 */

'use client';

import React from 'react';
import {
  HomeIcon,
  BriefcaseIcon,
  Squares2X2Icon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { User, Project } from '@/types';
import { Avatar } from '@/ui/components/Avatar';

export interface SidebarProps {
  /** User hiện tại đang đăng nhập */
  currentUser: User;
  /** Tab đang active */
  activeTab: 'dashboard' | 'projects' | 'tasks' | 'team';
  /** Project đang được chọn */
  selectedProjectId: string | null;
  /** Danh sách projects */
  projects: Project[];
  /** Callback khi click menu item */
  onTabChange: (tab: 'dashboard' | 'projects' | 'tasks' | 'team') => void;
  /** Callback khi click project (nhận string hoặc null để clear) */
  onProjectSelect: (projectId: string | null) => void;
  /** Callback khi logout */
  onLogout: () => void;
}

/**
 * Sidebar component với navigation và project list
 */
export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  selectedProjectId,
  projects,
  onTabChange,
  onProjectSelect,
  onLogout
}) => {
  // Handle tab change và clear selected project
  const handleTabClick = (tab: 'dashboard' | 'projects' | 'tasks' | 'team') => {
    onTabChange(tab);
    // Clear selected project khi đổi tab
    if (selectedProjectId) {
      onProjectSelect(null);
    }
  };

  // Handle project click
  const handleProjectClick = (projectId: string) => {
    onProjectSelect(projectId);
    onTabChange('tasks');
  };

  return (
    <aside className="hidden md:flex w-64 bg-primary flex-col shrink-0">
      {/* Logo */}
      <div className="p-8 flex items-center gap-3 border-b border-white/5">
        <div className="w-8 h-8 bg-accent rounded flex items-center justify-center text-white font-black">
          D
        </div>
        <span className="text-white font-bold tracking-tight">D-LINE PRO</span>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar">
        {/* Main menu items */}
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
            activeTab === 'dashboard'
              ? 'bg-white/10 text-white shadow-inner'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <HomeIcon className="w-5 h-5" /> Tổng quan
        </button>

        <button
          onClick={() => handleTabClick('projects')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
            activeTab === 'projects'
              ? 'bg-white/10 text-white shadow-inner'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BriefcaseIcon className="w-5 h-5" /> Dự án
        </button>

        <button
          onClick={() => handleTabClick('tasks')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
            activeTab === 'tasks'
              ? 'bg-white/10 text-white shadow-inner'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Squares2X2Icon className="w-5 h-5" /> Công việc
        </button>

        <button
          onClick={() => handleTabClick('team')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
            activeTab === 'team'
              ? 'bg-white/10 text-white shadow-inner'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserGroupIcon className="w-5 h-5" /> Nhân sự
        </button>

        {/* Project list section */}
        <div className="pt-8 px-4 pb-2">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            Dự án tham gia
          </span>
        </div>
        <div className="space-y-0.5">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProjectClick(p.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded text-xs transition-all ${
                selectedProjectId === p.id
                  ? 'text-white font-bold bg-white/5'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              {p.name}
            </button>
          ))}
        </div>
      </nav>

      {/* User profile footer */}
      <div className="p-4 bg-[#0A0F1E] flex items-center gap-3">
        <Avatar src={currentUser.avatar} name={currentUser.name} size="md" bordered />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white font-bold truncate">{currentUser.name}</p>
          <p className="text-[9px] text-slate-500 uppercase font-black">{currentUser.role}</p>
        </div>
        <button
          onClick={onLogout}
          className="p-2 text-slate-500 hover:text-red-400 transition-colors"
          aria-label="Đăng xuất"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};

