/**
 * TeamView Component
 * 
 * View hiển thị danh sách team members với workload stats
 */

'use client';

import React from 'react';
import { Task, TaskStatus, User, UserRole } from '@/types';
import { Avatar } from '../../components/Avatar';
import { TrashIcon } from '@heroicons/react/24/outline';

export interface TeamViewProps {
  /** Danh sách users */
  users: User[];
  /** Danh sách tasks */
  tasks: Task[];
  /** Role của user hiện tại */
  currentUserRole?: UserRole | string;
  /** Callback khi xóa user */
  onDeleteUser?: (userId: string) => void;
  /** Callback khi click vào user card để sửa */
  onUserClick?: (user: User) => void;
}

/**
 * TeamView component với user cards
 */
export const TeamView: React.FC<TeamViewProps> = ({
  users,
  tasks,
  currentUserRole,
  onDeleteUser,
  onUserClick
}) => {
  // Admin và Manager có quyền giống nhau
  const canManageUsers = currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.MANAGER;
  
  // Manager không thể xóa Admin
  const canDeleteUser = (targetUserRole: UserRole | string) => {
    if (!canManageUsers) return false;
    if (currentUserRole === UserRole.MANAGER && targetUserRole === UserRole.ADMIN) return false;
    return true;
  };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 modal-enter max-w-7xl mx-auto">
      {users.map(u => {
        const workload = tasks.filter(t => t.assigneeId === u.id && t.status !== TaskStatus.DONE).length;
        const completed = tasks.filter(t => t.assigneeId === u.id && t.status === TaskStatus.DONE).length;
        
        return (
          <div
            key={u.id}
            onClick={() => onUserClick?.(u)}
            className="bg-white p-3 md:p-6 rounded-lg border border-slate-200 shadow-sm text-center group hover:border-[#8907E6] transition-all relative cursor-pointer"
          >
            {canDeleteUser(u.role) && onDeleteUser && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Xóa người dùng "${u.name}"?`)) {
                    onDeleteUser(u.id);
                  }
                }}
                className="absolute top-1.5 right-1.5 md:top-2 md:right-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all z-10"
                title="Xóa người dùng"
              >
                <TrashIcon className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            )}
            <Avatar
              src={u.avatar}
              name={u.name}
              size="md"
              bordered
              className="mx-auto mb-2 md:mb-4 border-2 md:border-4 border-slate-50 shadow-inner"
            />
            <h4 className="text-xs md:text-base font-bold text-slate-900 group-hover:text-[#8907E6] mb-1">{u.name}</h4>
            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase mb-3 md:mb-6 tracking-widest">
              {u.role === 'admin' ? 'Quản trị viên' : u.role === 'manager' ? 'Quản lý' : u.role === 'employee' ? 'Nhân viên' : u.role}
            </p>
            <div className="pt-3 md:pt-6 border-t border-slate-50 flex justify-around">
              <div className="text-center">
                <p className="text-sm md:text-xl font-black text-slate-900">{workload}</p>
                <p className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase">Đang làm</p>
              </div>
              <div className="text-center">
                <p className="text-sm md:text-xl font-black text-slate-900">{completed}</p>
                <p className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase">Xong</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

