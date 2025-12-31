/**
 * AllTasksView Component
 * 
 * Hiển thị danh sách tất cả công việc được nhóm theo dự án
 * Khi click vào task, sẽ chọn dự án và chuyển sang view Kanban
 */

'use client';

import React, { useMemo } from 'react';
import { BriefcaseIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import { Task, Project, User, TaskStatus, TaskPriority } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Avatar } from '../../components/Avatar';

export interface AllTasksViewProps {
  /** Danh sách tất cả tasks */
  tasks: Task[];
  /** Danh sách projects */
  projects: Project[];
  /** Danh sách users */
  users: User[];
  /** Callback khi click vào task - sẽ chọn project và hiển thị Kanban */
  onTaskClick: (task: Task, projectId: string) => void;
}

/**
 * AllTasksView component - hiển thị tasks nhóm theo project
 */
export const AllTasksView: React.FC<AllTasksViewProps> = React.memo(({
  tasks,
  projects,
  users,
  onTaskClick
}) => {
  // Nhóm tasks theo projectId và filter out tasks với status DONE
  const tasksByProject = useMemo(() => {
    const groups: Record<string, { project: Project; tasks: Task[] }> = {};
    
    // Filter out tasks với status DONE
    const activeTasks = tasks.filter(task => task.status !== TaskStatus.DONE);
    
    activeTasks.forEach(task => {
      const project = projects.find(p => p.id === task.projectId);
      if (!project) return;
      
      if (!groups[task.projectId]) {
        groups[task.projectId] = {
          project,
          tasks: []
        };
      }
      groups[task.projectId].tasks.push(task);
    });
    
    // Sắp xếp tasks trong mỗi project: priority (HIGH first) rồi deadline
    Object.keys(groups).forEach(projectId => {
      groups[projectId].tasks.sort((a, b) => {
        const priorityOrder = { [TaskPriority.HIGH]: 0, [TaskPriority.MEDIUM]: 1, [TaskPriority.LOW]: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    });
    
    // Chỉ trả về các project có ít nhất 1 task (sau khi filter)
    return Object.values(groups).filter(group => group.tasks.length > 0);
  }, [tasks, projects]);

  // Lấy user từ assigneeId
  const getUser = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (tasksByProject.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-16">
        <BriefcaseIcon className="w-16 h-16 text-slate-300 mb-4" />
        <p className="text-slate-500 text-sm font-medium">Chưa có công việc nào</p>
        <p className="text-slate-400 text-xs mt-1">Tạo công việc mới để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 modal-enter">
      {tasksByProject.map(({ project, tasks: projectTasks }) => (
        <div
          key={project.id}
          className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Project Header */}
          <div
            className="h-1 w-full"
            style={{
              backgroundColor:
                project.color && project.color !== '#0F172A' && project.color !== 'rgb(15, 23, 42)'
                  ? project.color
                  : '#8907E6'
            }}
          />
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      project.color && project.color !== '#0F172A' && project.color !== 'rgb(15, 23, 42)'
                        ? project.color
                        : '#8907E6'
                  }}
                />
                <h3 className="text-sm font-bold text-slate-900">{project.name}</h3>
                <span className="px-2 py-0.5 text-[10px] font-black rounded border uppercase tracking-widest bg-slate-50 text-slate-600 border-slate-100">
                  {projectTasks.length} công việc
                </span>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-black rounded border uppercase tracking-widest ${
                  project.status === 'active'
                    ? 'bg-[#8907E6]/10 text-[#8907E6] border-[#8907E6]/20'
                    : project.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-slate-50 text-slate-600 border-slate-100'
                }`}
              >
                {project.status === 'active' ? 'Đang hoạt động' : project.status === 'completed' ? 'Hoàn thành' : 'Tạm dừng'}
              </span>
            </div>
          </div>

          {/* Tasks List */}
          <div className="divide-y divide-slate-100">
            {projectTasks.map((task) => {
              const assignee = getUser(task.assigneeId);
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onTaskClick(task, project.id)}
                  className="w-full p-4 text-left hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusBadge task={task} />
                        <div
                          className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase border ${
                            task.priority === TaskPriority.HIGH
                              ? 'bg-red-50 text-red-500 border-red-100'
                              : task.priority === TaskPriority.MEDIUM
                              ? 'bg-yellow-50 text-yellow-500 border-yellow-100'
                              : 'bg-slate-50 text-slate-400 border-slate-100'
                          }`}
                        >
                          {task.priority === TaskPriority.HIGH ? 'Cao' : task.priority === TaskPriority.MEDIUM ? 'Trung bình' : 'Thấp'}
                        </div>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2 transition-colors">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 mb-3">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {assignee && (
                          <div className="flex items-center gap-1.5">
                            <UserIcon className="w-3.5 h-3.5" />
                            <span className="truncate">{assignee.name}</span>
                          </div>
                        )}
                        {task.deadline && (
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            <span>{formatDate(task.deadline)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {assignee && (
                      <Avatar
                        src={assignee.avatar}
                        name={assignee.name}
                        size="sm"
                        className="shrink-0"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});

AllTasksView.displayName = 'AllTasksView';

