/**
 * TasksView Component
 * 
 * Kanban board với drag-and-drop functionality
 * Sử dụng @dnd-kit để implement drag and drop
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { Task, TaskPriority, TaskStatus, User } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Avatar } from '../../components/Avatar';
import { fetchJson } from '../../utils/api';

// Hook to detect mobile device
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export interface TasksViewProps {
  /** Danh sách tasks */
  tasks: Task[];
  /** Danh sách users */
  users: User[];
  /** Callback khi click vào task */
  onTaskClick: (task: Task) => void;
  /** Callback khi task được update (để sync state với parent) */
  onTaskUpdate?: (task: Task) => void;
}

// Kanban board columns - map to TaskStatus
const boardColumns = [
  { id: TaskStatus.NEW, label: 'Mới', color: '#6366F1' },
  { id: TaskStatus.BUG, label: 'Bug', color: '#EF4444' },
  { id: TaskStatus.IN_PROGRESS, label: 'Đang làm', color: '#3B82F6' },
  { id: TaskStatus.FIXED, label: 'Đã sửa', color: '#10B981' },
  { id: TaskStatus.DONE, label: 'Hoàn thành', color: '#94A3B8' }
];

/**
 * Draggable Task Card Component
 */
interface TaskCardProps {
  task: Task;
  users: User[];
  onClick: () => void;
  isMobile?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, users, onClick, isMobile = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id, disabled: isMobile });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const assignee = users.find(u => u.id === task.assigneeId);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isMobile ? {} : attributes)}
      {...(isMobile ? {} : listeners)}
      onClick={onClick}
      className={`bg-white p-3 rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-[#8907E6]/30 transition-all group relative ${
        isMobile ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      <div className="flex justify-between items-start mb-2.5">
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
      <h4 className="text-xs font-semibold text-slate-700 mb-3 leading-snug line-clamp-2 transition-colors">
        {task.title}
      </h4>
      <div className="flex justify-between items-center mt-auto">
        <div className="flex items-center gap-1.5">
          <Avatar
            src={assignee?.avatar || ''}
            name={assignee?.name || ''}
            size="sm"
          />
          {task.imageUrls && task.imageUrls.length > 0 && (
            <span className="flex items-center gap-1 text-slate-300">
              <PhotoIcon className="w-3 h-3" />
            </span>
          )}
        </div>
        {task.deadline && (
          <span className="text-[10px] font-semibold text-slate-400">
            {new Date(task.deadline).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit'
            })}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Kanban Column Component
 */
interface KanbanColumnProps {
  column: typeof boardColumns[0];
  tasks: Task[];
  users: User[];
  onTaskClick: (task: Task) => void;
  isMobile?: boolean;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  users,
  onTaskClick,
  isMobile = false
}) => {
  const taskIds = tasks.map(t => t.id);
  
  // Make column droppable
  const { setNodeRef, isOver } = useDroppable({
    id: column.id
  });

  return (
    <div className="kanban-column flex flex-col select-none h-full">
      <div className="flex items-center justify-between px-3 py-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
            {column.label}
          </span>
          <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {tasks.length}
          </span>
        </div>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 bg-white rounded-lg p-2 space-y-2 border shadow-sm transition-all ${
            isOver ? 'border-[#8907E6] border-2 bg-[#8907E6]/10 shadow-md' : 'border-slate-200 shadow-sm'
          }`}
        >
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              users={users}
              onClick={() => onTaskClick(task)}
              isMobile={isMobile}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

/**
 * TasksView component với Kanban board và drag-and-drop
 */
export const TasksView: React.FC<TasksViewProps> = React.memo(({
  tasks,
  users,
  onTaskClick,
  onTaskUpdate
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>(tasks);
  const isMobile = useIsMobile();

  // Update optimistic tasks when tasks prop changes
  React.useEffect(() => {
    setOptimisticTasks(tasks);
  }, [tasks]);

  // Configure sensors for drag and drop
  // Only enable drag on desktop, disable on mobile
  // Always create the same number of sensors to avoid React hook dependency issues
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: isMobile
        ? {
            distance: 999999 // Effectively disable on mobile
          }
        : {
            distance: 8 // Require 8px of movement before activating drag
          }
    })
  );

  // Group tasks by status and sort by priority (HIGH first) then by due date (soonest first)
  const tasksByStatus = React.useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = {
      [TaskStatus.NEW]: [],
      [TaskStatus.BUG]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.FIXED]: [],
      [TaskStatus.DONE]: []
    };

    optimisticTasks.forEach(task => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      }
    });

    // Sort tasks in each group: priority (HIGH first) then by due date (soonest first)
    const priorityOrder = { [TaskPriority.HIGH]: 0, [TaskPriority.MEDIUM]: 1, [TaskPriority.LOW]: 2 };
    
    Object.keys(groups).forEach(status => {
      groups[status as TaskStatus].sort((a, b) => {
        // First sort by priority (HIGH first)
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then sort by due date (soonest first, null/undefined last)
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    });

    return groups;
  }, [optimisticTasks]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = optimisticTasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  // Handle drag end - update task status
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !active) return;

    const taskId = active.id as string;
    
    // Find the task
    const task = optimisticTasks.find(t => t.id === taskId);
    if (!task) return;

    // Determine new status:
    // 1. If dropped on a column (over.id is a TaskStatus), use that
    // 2. If dropped on another task, find which column that task belongs to
    let newStatus: TaskStatus | null = null;
    
    // Check if over.id is a valid TaskStatus (column ID)
    if (Object.values(TaskStatus).includes(over.id as TaskStatus)) {
      newStatus = over.id as TaskStatus;
    } else {
      // If dropped on another task, find that task's status
      const targetTask = optimisticTasks.find(t => t.id === over.id);
      if (targetTask) {
        newStatus = targetTask.status;
      }
    }

    // If couldn't determine new status, do nothing
    if (!newStatus) return;

    // If dropped in the same column, do nothing
    if (task.status === newStatus) return;

    // Optimistic update - update UI immediately
    const updatedTask: Task = { ...task, status: newStatus };
    setOptimisticTasks(prev =>
      prev.map(t => (t.id === taskId ? updatedTask : t))
    );

    // Call API to update task status
    try {
      const url = `/api/tasks/${encodeURIComponent(taskId)}`;
      const requestBody = { status: newStatus };
      
      const res = await fetchJson<{ ok: true; data: Task }>(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      // Update with server response
      const updatedTaskFromServer = res.data;
      setOptimisticTasks(prev =>
        prev.map(t => (t.id === taskId ? updatedTaskFromServer : t))
      );

      // Notify parent component
      if (onTaskUpdate) {
        onTaskUpdate(updatedTaskFromServer);
      }
    } catch (error) {
      // Check if it's a network error or actual API error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStatus = error instanceof Error ? (error as any).status : null;
      
      // If it's a network error (no status code), the update might have succeeded
      // Only revert if it's a clear API error (400, 404, 500)
      const isApiError = errorStatus && [400, 404, 500].includes(errorStatus);
      
      if (isApiError) {
        // For 500 errors, the update might have actually succeeded
        // Don't revert for 500 errors - they might be false negatives
        // User can reload if needed
        if (errorStatus !== 500) {
          // Revert optimistic update on clear API error (400, 404)
          setOptimisticTasks(prev =>
            prev.map(t => (t.id === taskId ? task : t))
          );
          alert(`Không thể cập nhật trạng thái công việc: ${errorMessage}`);
        }
      }
      // For network errors or unknown errors, keep optimistic update
      // The update might have succeeded on the server
    }
  };

  // Get all task IDs for DndContext
  const allTaskIds = optimisticTasks.map(t => t.id);

  return (
    <div className="h-full flex flex-col modal-enter relative">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={`flex gap-3 overflow-x-auto kanban-scrollbar ${isMobile ? 'pb-8' : 'pb-4'} h-full`}>
          {boardColumns.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasksByStatus[column.id] || []}
              users={users}
              onTaskClick={onTaskClick}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Drag overlay - shows task being dragged */}
        <DragOverlay>
          {activeTask ? (
            <div className="bg-white p-3 rounded-lg border-2 border-[#8907E6] shadow-xl opacity-95 rotate-1">
              <div className="flex justify-between items-start mb-2.5">
                <StatusBadge task={activeTask} />
                <div
                  className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase border ${
                    activeTask.priority === TaskPriority.HIGH
                      ? 'bg-red-50 text-red-500 border-red-100'
                      : activeTask.priority === TaskPriority.MEDIUM
                      ? 'bg-yellow-50 text-yellow-500 border-yellow-100'
                      : 'bg-slate-50 text-slate-400 border-slate-100'
                  }`}
                >
                  {activeTask.priority === TaskPriority.HIGH ? 'Cao' : activeTask.priority === TaskPriority.MEDIUM ? 'Trung bình' : 'Thấp'}
                </div>
              </div>
              <h4 className="text-xs font-semibold text-slate-700 mb-3 leading-snug line-clamp-2">
                {activeTask.title}
              </h4>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      
      {/* Mobile tooltip - hiển thị dưới thanh scroll, cố định, chỉ text */}
      {isMobile && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-slate-500 text-[10px] text-center pointer-events-none z-10">
          Vào xem chi tiết để thay đổi trạng thái
        </div>
      )}
    </div>
  );
});

TasksView.displayName = 'TasksView';
