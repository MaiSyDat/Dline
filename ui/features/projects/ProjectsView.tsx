/**
 * ProjectsView Component
 * 
 * View hiển thị danh sách projects dạng grid
 */

'use client';

import React, { useState } from 'react';
import { BriefcaseIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Project, User } from '@/types';
import { Avatar } from '../../components/Avatar';

export interface ProjectsViewProps {
  /** Danh sách projects */
  projects: Project[];
  /** Danh sách users */
  users: User[];
  /** Callback khi click vào project */
  onProjectClick: (projectId: string) => void;
  /** Callback khi click sửa project */
  onEditProject?: (project: Project) => void;
  /** Callback khi click xem project */
  onViewProject?: (project: Project) => void;
}

/**
 * Avatar với tooltip hiển thị tên và role
 */
const AvatarWithTooltip: React.FC<{ user: User }> = ({ user }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div 
      className="relative" 
      onMouseEnter={() => setShowTooltip(true)} 
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Avatar
        src={user.avatar || ''}
        name={user.name || ''}
        size="sm"
      />
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50">
          <p className="font-bold">{user.name}</p>
          <p className="text-[10px] text-slate-300 uppercase mt-0.5">{user.role}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

/**
 * ProjectsView component với project cards
 */
export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  users,
  onProjectClick,
  onEditProject,
  onViewProject
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 modal-enter max-w-7xl mx-auto">
      {projects.map(p => (
        <div
          key={p.id}
          onClick={() => onProjectClick(p.id)}
          className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col"
        >
          <div className="h-1 w-full" style={{ backgroundColor: p.color && p.color !== '#0F172A' && p.color !== 'rgb(15, 23, 42)' ? p.color : '#8907E6' }}></div>
          <div className="p-4 md:p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="p-1.5 bg-white border border-slate-200 rounded group-hover:bg-[#8907E6]/5 transition-colors">
                <BriefcaseIcon className="w-4 h-4 text-slate-300 group-hover:text-[#8907E6]" />
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-black rounded border uppercase tracking-widest ${
                p.status === 'active' 
                  ? 'bg-[#8907E6]/10 text-[#8907E6] border-[#8907E6]/20' 
                  : p.status === 'completed' 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                  : 'bg-slate-50 text-slate-600 border-slate-100'
              }`}>
                {p.status === 'active' ? 'Đang hoạt động' : p.status === 'completed' ? 'Hoàn thành' : p.status === 'on-hold' ? 'Tạm dừng' : p.status}
              </span>
            </div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#8907E6] transition-colors flex-1">
                {p.name}
              </h3>
              <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                {onViewProject && (
                  <button
                    onClick={() => onViewProject(p)}
                    className="p-1.5 text-slate-400 hover:text-[#8907E6] hover:bg-[#8907E6]/5 rounded transition-all"
                    title="Xem dự án"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                )}
                {onEditProject && (
                  <button
                    onClick={() => onEditProject(p)}
                    className="p-1.5 text-slate-400 hover:text-[#FF33E7] hover:bg-[#FF33E7]/5 rounded transition-all"
                    title="Sửa dự án"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-4">
              {p.description}
            </p>
            <div className="flex justify-between items-center pt-4 border-t border-slate-50">
              <div className="flex -space-x-2">
                {p.memberIds && p.memberIds.length > 0 ? (
                  <>
                    {p.memberIds.slice(0, 3).map(mid => {
                      const member = users.find(u => u.id === mid);
                      if (!member) return null;
                      return <AvatarWithTooltip key={mid} user={member} />;
                    })}
                    {p.memberIds.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400 border-2 border-white">
                        +{p.memberIds.length - 3}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Chưa có thành viên</span>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-300 uppercase">Hạn</p>
                <p className="text-[10px] font-bold text-slate-800">
                  {new Date(p.deadline || '').toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

