/**
 * DashboardView Component
 * 
 * View hiển thị dashboard với stats và recent tasks
 */

'use client';

import React, { useState } from 'react';
import { BriefcaseIcon, Squares2X2Icon, CheckIcon, BugAntIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Project, Task, TaskStatus, User } from '@/types';
import { StatusBadge } from '../tasks/StatusBadge';
import { getGeminiInsights } from '@/services/geminiService';
import { Button } from '../../components/Button';
import { formatDate } from '../../utils/dateUtils';

export interface DashboardViewProps {
  /** Danh sách projects */
  projects: Project[];
  /** Danh sách tasks */
  tasks: Task[];
  /** Danh sách users */
  users: User[];
  /** Callback khi click vào task */
  onTaskClick: (task: Task) => void;
}

/**
 * DashboardView component với stats và recent tasks
 */
export const DashboardView: React.FC<DashboardViewProps> = React.memo(({
  projects,
  tasks,
  users,
  onTaskClick
}) => {
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Load AI insights using Server Action
  const handleLoadInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const insights = await getGeminiInsights(tasks, users);
      setAiInsights(insights);
    } catch (error) {
      setAiInsights('Không thể tải AI insights. Vui lòng thử lại sau.');
    } finally {
      setIsLoadingInsights(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 modal-enter max-w-7xl mx-auto">
      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {[
          { label: 'Dự án đang chạy', val: projects.length, icon: BriefcaseIcon, color: 'text-slate-900', bg: 'bg-white' },
          { label: 'Tổng công việc', val: tasks.length, icon: Squares2X2Icon, color: 'text-[#8907E6]', bg: 'bg-white' },
          { label: 'Việc hoàn thành', val: tasks.filter(t => t.status === TaskStatus.DONE).length, icon: CheckIcon, color: 'text-emerald-600', bg: 'bg-white' },
          { label: 'Tổng lỗi (Bugs)', val: tasks.filter(t => t.status === TaskStatus.BUG).length, icon: BugAntIcon, color: 'text-red-500', bg: 'bg-white' }
        ].map((s, i) => (
          <div key={i} className={`${s.bg} p-3 md:p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-[#8907E6] transition-all`}>
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform">
              <s.icon className={`w-4 h-4 md:w-6 md:h-6 ${s.color}`} />
            </div>
            <p className="text-lg md:text-3xl font-black text-slate-900">{s.val}</p>
            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mt-0.5 md:mt-1 tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent tasks */}
      <div className="bg-white p-4 md:p-8 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4 md:mb-8">
          <h3 className="font-black text-slate-900 text-[10px] md:text-sm uppercase tracking-widest">
            Tình trạng công việc gần nhất
          </h3>
          <button className="text-[9px] md:text-[10px] font-bold text-[#8907E6] hover:underline uppercase">
            Tất cả
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {tasks.filter(t => t.status !== TaskStatus.DONE).slice(0, 5).map(t => (
            <div
              key={t.id}
              onClick={() => onTaskClick(t)}
              className="flex items-center justify-between py-3 md:py-5 hover:bg-slate-50 px-2 md:px-4 md:-mx-4 transition-all cursor-pointer group rounded-md"
            >
              <div className="flex items-center gap-2 md:gap-5 min-w-0 flex-1">
                <StatusBadge task={t} />
                <p className="text-[10px] md:text-sm font-bold text-slate-700 truncate">
                  {t.title}
                </p>
              </div>
              <div className="flex items-center gap-2 md:gap-8 shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-[9px] font-black text-slate-300 uppercase">Hạn chót</p>
                  <p className="text-xs font-bold text-slate-500">
                    {formatDate(t.deadline)}
                  </p>
                </div>
                <img
                  src={users.find(u => u.id === t.assigneeId)?.avatar}
                  className="w-5 h-5 md:w-8 md:h-8 rounded-full border border-slate-100 shadow-sm"
                  alt="Người thực hiện"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-white p-6 md:p-8 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-5 h-5 text-[#FF33E7]" />
            <h3 className="font-black text-slate-900 text-[10px] md:text-sm uppercase tracking-widest">
              Phân tích AI
            </h3>
          </div>
          {!aiInsights && (
            <Button
              onClick={handleLoadInsights}
              loading={isLoadingInsights}
              variant="accent"
              size="sm"
            >
              Tạo Insights
            </Button>
          )}
        </div>
        {aiInsights ? (
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {aiInsights}
            </p>
            <div className="mt-4">
              <Button
                onClick={handleLoadInsights}
                loading={isLoadingInsights}
                variant="ghost"
                size="sm"
              >
                Tải lại
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">
            Nhấn "Tạo Insights" để nhận phân tích AI về workload và deadlines của team.
          </p>
        )}
      </div>
    </div>
  );
});

DashboardView.displayName = 'DashboardView';

