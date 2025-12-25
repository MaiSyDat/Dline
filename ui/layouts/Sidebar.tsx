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
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { User, Project } from '@/types';
import { Avatar, LogoutButton } from '@/ui/components';

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
  onProjectSelect
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
    <aside className="hidden md:flex w-64 bg-white flex-col shrink-0 border-r border-slate-200 shadow-md">
      {/* Logo */}
      <div className="py-2 flex items-center border-b border-slate-200">
        <img 
          src="/img/logo/logo.png" 
          alt="D-LINE PRO" 
          className="w-full h-[100px] object-contain"
        />
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar">
        {/* Main menu items */}
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
            activeTab === 'dashboard'
              ? 'bg-slate-100 text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <HomeIcon className="w-5 h-5" /> Tổng quan
        </button>

        <button
          onClick={() => handleTabClick('projects')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
            activeTab === 'projects'
              ? 'bg-slate-100 text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BriefcaseIcon className="w-5 h-5" /> Dự án
        </button>

        <button
          onClick={() => handleTabClick('tasks')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
            activeTab === 'tasks'
              ? 'bg-slate-100 text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Squares2X2Icon className="w-5 h-5" /> Công việc
        </button>

        <button
          onClick={() => handleTabClick('team')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
            activeTab === 'team'
              ? 'bg-slate-100 text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UserGroupIcon className="w-5 h-5" /> Nhân sự
        </button>

        {/* Project list section */}
        <div className="pt-8 px-4 pb-2 border-t border-slate-200 mt-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
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
                  ? 'text-slate-900 font-bold bg-slate-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: p.color && p.color !== '#0F172A' && p.color !== 'rgb(15, 23, 42)' ? p.color : '#8907E6' }}
              />
              {p.name}
            </button>
          ))}
        </div>
      </nav>

      {/* User profile footer */}
      <div className="p-4 bg-white border-t border-slate-200 shadow-sm flex items-center gap-3">
        <Avatar src={currentUser.avatar} name={currentUser.name} size="md" bordered />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-900 font-bold truncate">{currentUser.name}</p>
          <p className="text-[10px] text-slate-500 uppercase font-black">{currentUser.role}</p>
        </div>
        <LogoutButton variant="icon" />
      </div>
    </aside>
  );
};

