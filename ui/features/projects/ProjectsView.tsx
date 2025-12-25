/**
 * ProjectsView Component
 * 
 * View hiển thị danh sách projects dạng grid
 */

'use client';

import React from 'react';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
import { Project, User } from '@/types';
import { Avatar } from '../../components/Avatar';

export interface ProjectsViewProps {
  /** Danh sách projects */
  projects: Project[];
  /** Danh sách users */
  users: User[];
  /** Callback khi click vào project */
  onProjectClick: (projectId: string) => void;
}

/**
 * ProjectsView component với project cards
 */
export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  users,
  onProjectClick
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 modal-enter max-w-7xl mx-auto">
      {projects.map(p => (
        <div
          key={p.id}
          onClick={() => onProjectClick(p.id)}
          className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col"
        >
          <div className="h-1 w-full" style={{ backgroundColor: p.color }}></div>
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="p-2 bg-slate-50 rounded group-hover:bg-accent/5 transition-colors">
                <BriefcaseIcon className="w-5 h-5 md:w-6 md:h-6 text-slate-300 group-hover:text-accent" />
              </div>
              <span className={`px-2 py-0.5 text-[9px] font-black rounded border uppercase tracking-widest ${
                p.status === 'active' 
                  ? 'bg-blue-50 text-blue-600 border-blue-100' 
                  : p.status === 'completed' 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                  : 'bg-slate-50 text-slate-600 border-slate-100'
              }`}>
                {p.status === 'active' ? 'Đang hoạt động' : p.status === 'completed' ? 'Hoàn thành' : p.status === 'on-hold' ? 'Tạm dừng' : p.status}
              </span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 group-hover:text-accent transition-colors">
              {p.name}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-6 md:mb-10">
              {p.description}
            </p>
            <div className="flex justify-between items-center pt-6 md:pt-8 border-t border-slate-50">
              <div className="flex -space-x-2">
                {p.memberIds.slice(0, 3).map(mid => (
                  <Avatar
                    key={mid}
                    src={users.find(u => u.id === mid)?.avatar || ''}
                    name={users.find(u => u.id === mid)?.name || ''}
                    size="md"
                    bordered
                  />
                ))}
                {p.memberIds.length > 3 && (
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-100 flex items-center justify-center text-[8px] md:text-[9px] font-bold text-slate-400 border-2 border-white">
                    +{p.memberIds.length - 3}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-300 uppercase">Hạn</p>
                <p className="text-xs font-bold text-slate-800">
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

