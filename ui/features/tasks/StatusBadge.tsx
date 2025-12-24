/**
 * StatusBadge Component
 * 
 * Component hiển thị status badge cho task
 * Hỗ trợ các status: NEW, BUG, IN_PROGRESS, FIXED, DONE
 */

import React from 'react';
import { BugAntIcon } from '@heroicons/react/24/outline';
import { Task, TaskStatus } from '@/types';
import { Badge } from '../../components/Badge';

export interface StatusBadgeProps {
  /** Task để lấy status */
  task: Task;
}

/**
 * StatusBadge component với icon và màu sắc tương ứng
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ task }) => {
  // Render badge dựa trên status
  if (task.status === TaskStatus.BUG) {
    return (
      <Badge variant="danger" className="flex items-center gap-1">
        <BugAntIcon className="w-3 h-3" />
        Lỗi
      </Badge>
    );
  }

  if (task.status === TaskStatus.DONE) {
    return <Badge variant="success">Xong</Badge>;
  }

  return <Badge>{task.status}</Badge>;
};

