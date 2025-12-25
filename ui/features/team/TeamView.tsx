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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 modal-enter max-w-7xl mx-auto">
      {users.map(u => {
        const workload = tasks.filter(t => t.assigneeId === u.id && t.status !== TaskStatus.DONE).length;
        const completed = tasks.filter(t => t.assigneeId === u.id && t.status === TaskStatus.DONE).length;
        
        return (
          <div
            key={u.id}
            onClick={() => onUserClick?.(u)}
            className="bg-white p-6 md:p-8 rounded-lg border border-slate-200 shadow-sm text-center group hover:border-accent transition-all relative cursor-pointer"
          >
            {canDeleteUser(u.role) && onDeleteUser && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Xóa người dùng "${u.name}"?`)) {
                    onDeleteUser(u.id);
                  }
                }}
                className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all z-10"
                title="Xóa người dùng"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
            <Avatar
              src={u.avatar}
              name={u.name}
              size="xl"
              bordered
              className="mx-auto mb-6 border-4 border-slate-50 shadow-inner"
            />
            <h4 className="font-bold text-slate-900 group-hover:text-accent">{u.name}</h4>
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest">
              {u.role === 'admin' ? 'Quản trị viên' : u.role === 'manager' ? 'Quản lý' : u.role === 'employee' ? 'Nhân viên' : u.role}
            </p>
            <div className="pt-6 border-t border-slate-50 flex justify-around">
              <div className="text-center">
                <p className="text-lg md:text-xl font-black text-slate-900">{workload}</p>
                <p className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase">Đang làm</p>
              </div>
              <div className="text-center">
                <p className="text-lg md:text-xl font-black text-slate-900">{completed}</p>
                <p className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase">Xong</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

