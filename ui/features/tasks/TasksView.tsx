/**
 * TasksView Component
 * 
 * View hiển thị tasks dạng kanban board với drag to scroll
 */

'use client';

import React, { useRef, useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { Task, TaskPriority, User } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Avatar } from '../../components/Avatar';

export interface TasksViewProps {
  /** Danh sách tasks đã được group theo deadline */
  kanbanGroups: Record<string, Task[]>;
  /** Danh sách users */
  users: User[];
  /** Callback khi click vào task */
  onTaskClick: (task: Task) => void;
}

// Kanban board columns configuration
const boardColumns = [
  { id: 'overdue', label: 'Quá hạn', color: '#EF4444' },
  { id: 'today', label: 'Hôm nay', color: '#10B981' },
  { id: 'thisWeek', label: 'Tuần này', color: '#3B82F6' },
  { id: 'later', label: 'Sắp tới', color: '#6366F1' },
  { id: 'done', label: 'Đã xong', color: '#94A3B8' }
];

/**
 * TasksView component với kanban board
 */
export const TasksView: React.FC<TasksViewProps> = ({
  kanbanGroups,
  users,
  onTaskClick
}) => {
  const kanbanRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Kanban drag handlers
  const startDragging = (e: React.MouseEvent) => {
    if (!kanbanRef.current) return;
    setIsScrolling(true);
    setStartX(e.pageX - kanbanRef.current.offsetLeft);
    setScrollLeft(kanbanRef.current.scrollLeft);
  };

  const stopDragging = () => setIsScrolling(false);

  const moveDragging = (e: React.MouseEvent) => {
    if (!isScrolling || !kanbanRef.current) return;
    e.preventDefault();
    const x = e.pageX - kanbanRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    kanbanRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="h-full flex flex-col modal-enter relative">
      <div
        className={`flex gap-4 md:gap-6 overflow-x-auto pb-10 custom-scrollbar grab-scroll ${
          isScrolling ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        ref={kanbanRef}
        onMouseDown={startDragging}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        onMouseMove={moveDragging}
      >
        {boardColumns.map(col => (
          <div key={col.id} className="kanban-column flex flex-col select-none">
            <div className="flex items-center justify-between px-3 mb-4 md:mb-5">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black text-slate-600 uppercase tracking-[0.15em]">
                  {col.label}
                </span>
                <span className="bg-slate-200/60 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-black">
                  {kanbanGroups[col.id]?.length || 0}
                </span>
              </div>
            </div>
            <div className="flex-1 bg-slate-200/30 rounded-lg p-3 space-y-3 md:space-y-4 min-h-[500px] border border-slate-200/40">
              {kanbanGroups[col.id]?.map(task => (
                <div
                  key={task.id}
                  onClick={(e) => {
                    if (isScrolling) return;
                    onTaskClick(task);
                  }}
                  className="bg-white p-4 md:p-5 rounded-md border border-slate-200 shadow-sm hover:border-accent transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3 md:mb-4">
                    <StatusBadge task={task} />
                    <div
                      className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                        task.priority === TaskPriority.HIGH
                          ? 'bg-red-50 text-red-500 border-red-100'
                          : 'bg-slate-50 text-slate-400 border-slate-100'
                      }`}
                    >
                      {task.priority}
                    </div>
                  </div>
                  <h4 className="text-[13px] font-bold text-slate-800 mb-4 md:mb-5 leading-relaxed line-clamp-2 group-hover:text-accent transition-colors">
                    {task.title}
                  </h4>
                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={users.find(u => u.id === task.assigneeId)?.avatar || ''}
                        name={users.find(u => u.id === task.assigneeId)?.name || ''}
                        size="sm"
                      />
                      {task.imageUrls && task.imageUrls.length > 0 && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <PhotoIcon className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold flex items-center gap-1 ${
                        col.id === 'overdue' ? 'text-red-500' : 'text-slate-400'
                      }`}
                    >
                      {new Date(task.deadline || '').toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

