'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRightOnRectangleIcon,
  BriefcaseIcon,
  BugAntIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  FolderPlusIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  PlusIcon,
  Squares2X2Icon,
  TrashIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Project, Task, TaskPriority, TaskStatus, User, UserRole } from '@/types';

// UI Components - Import từ thư mục ui
import { Loading } from '@/ui/components';
import { Sidebar, Header, MobileNav } from '@/ui/layouts';
import {
  LoginForm,
  SearchableUserSelect,
  DashboardView,
  ProjectsView,
  TasksView,
  TeamView,
  StatusBadge
} from '@/ui/features';
import { fetchJson } from '@/ui/utils/api';

// Kanban board columns configuration đã được move vào TasksView component

const AppShell: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'tasks' | 'team'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [newProjectMembers, setNewProjectMembers] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  // Kanban drag state đã được move vào TasksView component
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [{ data: userData }, { data: projectData }, { data: taskData }] = await Promise.all([
          fetchJson<{ ok: true; data: User[] }>('/api/users'),
          fetchJson<{ ok: true; data: Project[] }>('/api/projects'),
          fetchJson<{ ok: true; data: Task[] }>('/api/tasks')
        ]);
        setUsers(userData);
        setProjects(projectData);
        setTasks(taskData);
        setGlobalError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không tải được dữ liệu';
        setGlobalError(message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Kanban drag handlers đã được move vào TasksView component

  // Login được xử lý bởi LoginForm component
  const handleLogout = () => { setCurrentUser(null); setActiveTab('dashboard'); setSelectedProjectId(null); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const readers = Array.from(files).map((file: File) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(readers).then(results => setPreviewImages(prev => [...prev, ...results]));
    }
  };

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const f = new FormData(e.currentTarget);
    try {
      const payload = {
        projectId: f.get('projectId'),
        title: f.get('title'),
        description: f.get('description'),
        assigneeId: f.get('assigneeId'),
        startDate: f.get('startDate'),
        deadline: f.get('deadline'),
        status: (f.get('isBug') === 'on' ? TaskStatus.BUG : TaskStatus.NEW) as TaskStatus,
        priority: (f.get('priority') || TaskPriority.MEDIUM) as TaskPriority,
        imageUrls: previewImages.length > 0 ? previewImages : undefined
      };
      const res = await fetchJson<{ ok: true; data: Task }>('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setTasks(prev => [...prev, res.data]);
      setIsTaskModalOpen(false);
      setPreviewImages([]);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Không tạo được công việc');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const f = new FormData(e.currentTarget);
    try {
      const payload = {
        name: f.get('name'),
        description: f.get('description'),
        memberIds: newProjectMembers,
        startDate: f.get('startDate'),
        deadline: f.get('deadline'),
        managerId: currentUser?.id,
        status: 'active'
      };
      const res = await fetchJson<{ ok: true; data: Project }>('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setProjects(prev => [...prev, res.data]);
      setIsProjectModalOpen(false);
      setNewProjectMembers([]);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Không tạo được dự án');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetchJson('/api/tasks/' + taskId, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setSelectedTask(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Không xóa được công việc');
    }
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const f = new FormData(e.currentTarget);
    const payload = {
      name: f.get('name'),
      email: f.get('email'),
      password: f.get('password'),
      role: f.get('role') || UserRole.EMPLOYEE,
      avatar: f.get('avatar') || undefined
    };
    try {
      const res = await fetchJson<{ ok: true; data: User }>('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setUsers(prev => [...prev, res.data]);
      setIsUserModalOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Không tạo được nhân sự');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkDone = async (task: Task) => {
    try {
      const res = await fetchJson<{ ok: true; data: Task }>('/api/tasks/' + task.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: TaskStatus.DONE })
      });
      setTasks(prev => prev.map(t => (t.id === task.id ? res.data : t)));
      setSelectedTask(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Không cập nhật được công việc');
    }
  };

  const filteredTasks = useMemo(() => {
    return selectedProjectId ? tasks.filter(t => t.projectId === selectedProjectId) : tasks;
  }, [tasks, selectedProjectId]);

  const kanbanGroups = useMemo(() => {
    const groups: Record<string, Task[]> = { overdue: [], today: [], thisWeek: [], later: [], done: [] };
    const now = new Date(); now.setHours(0, 0, 0, 0);

    filteredTasks.forEach(t => {
      if (t.status === TaskStatus.DONE) { groups.done.push(t); return; }
      if (!t.deadline) { groups.later.push(t); return; }
      const d = new Date(t.deadline); d.setHours(0, 0, 0, 0);
      const diff = Math.floor((d.getTime() - now.getTime()) / (86400000));

      if (diff < 0) groups.overdue.push(t);
      else if (diff === 0) groups.today.push(t);
      else if (diff > 0 && diff <= 7) groups.thisWeek.push(t);
      else groups.later.push(t);
    });
    return groups;
  }, [filteredTasks]);

  // StatusBadge đã được tách thành component riêng trong ui/features/tasks/StatusBadge.tsx

  // Show loading screen - sử dụng Loading component
  if (isLoading) {
    return <Loading message="Đang tải dữ liệu..." error={globalError} fullScreen />;
  }

  // Show login screen - sử dụng LoginForm component
  if (!currentUser) {
    return <LoginForm onLoginSuccess={setCurrentUser} userCount={users.length} />;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden relative">
      {/* Sidebar - sử dụng Sidebar component */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        selectedProjectId={selectedProjectId}
        projects={projects}
        onTabChange={(tab) => { 
          setActiveTab(tab); 
          setSelectedProjectId(null); 
        }}
        onProjectSelect={(id) => { 
          setSelectedProjectId(id); 
          setActiveTab('tasks'); 
        }}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - sử dụng Header component */}
        <Header
          activeTab={activeTab}
          selectedProjectId={selectedProjectId}
          projects={projects}
          onBack={() => setSelectedProjectId(null)}
          onCreateProject={() => setIsProjectModalOpen(true)}
          onCreateUser={() => setIsUserModalOpen(true)}
          onCreateTask={() => setIsTaskModalOpen(true)}
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-10 pb-24 md:pb-10">
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <DashboardView
              projects={projects}
              tasks={tasks}
              users={users}
              onTaskClick={setSelectedTask}
            />
          )}

          {/* Projects View */}
          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              users={users}
              onProjectClick={(id) => {
                setSelectedProjectId(id);
                setActiveTab('tasks');
              }}
            />
          )}

          {/* Tasks View */}
          {activeTab === 'tasks' && (
            <TasksView
              kanbanGroups={kanbanGroups}
              users={users}
              onTaskClick={setSelectedTask}
            />
          )}

          {/* Team View */}
          {activeTab === 'team' && (
            <TeamView users={users} tasks={tasks} />
          )}
        </div>
      </main>

      {/* Mobile Navigation - sử dụng MobileNav component */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab); setSelectedProjectId(null); }}
        onClearSelection={() => setSelectedProjectId(null)}
      />

      {isUserModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setIsUserModalOpen(false)}>
          <div className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden modal-enter max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 bg-primary text-white flex justify-between items-center shrink-0">
              <h3 className="text-xs font-black uppercase tracking-widest">Thêm nhân sự</h3>
              <button onClick={() => setIsUserModalOpen(false)}><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Họ tên</label>
                <input required name="name" className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm bg-slate-50 focus:bg-white" placeholder="Tên nhân sự..." />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                <input required name="email" type="email" className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm bg-slate-50 focus:bg-white" placeholder="email@company.com" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mật khẩu</label>
                <input required name="password" type="password" className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm bg-slate-50 focus:bg-white" placeholder="******" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vai trò</label>
                <select name="role" className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm bg-slate-50">
                  <option value={UserRole.EMPLOYEE}>Employee</option>
                  <option value={UserRole.MANAGER}>Manager</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avatar (tuỳ chọn)</label>
                <input name="avatar" className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm bg-slate-50 focus:bg-white" placeholder="https://..." />
              </div>
              <button disabled={isSubmitting} className="w-full py-3.5 bg-primary text-white rounded font-black text-sm uppercase tracking-widest mt-2 disabled:opacity-60">
                {isSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setIsProjectModalOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-hidden modal-enter max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 bg-primary text-white flex justify-between items-center shrink-0">
              <h3 className="text-xs font-black uppercase tracking-widest">Khởi tạo dự án mới</h3>
              <button onClick={() => setIsProjectModalOpen(false)}><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tên dự án</label>
                <input required name="name" className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm bg-slate-50 focus:bg-white" placeholder="Tên dự án..." />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mô tả</label>
                <textarea name="description" rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm bg-slate-50 focus:bg-white" placeholder="Mô tả dự án..." />
              </div>
              <SearchableUserSelect users={users} selectedIds={newProjectMembers} onChange={setNewProjectMembers} label="Thành viên" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngày bắt đầu</label>
                  <input required name="startDate" type="date" className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm bg-slate-50" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hạn bàn giao</label>
                  <input required name="deadline" type="date" className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm bg-slate-50" />
                </div>
              </div>
              <button className="w-full py-3.5 bg-primary text-white rounded font-black text-sm uppercase tracking-widest mt-2">Xác nhận dự án</button>
            </form>
          </div>
        </div>
      )}

      {isTaskModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setIsTaskModalOpen(false)}>
          <div className="bg-white w-full max-w-xl rounded-lg shadow-2xl overflow-hidden modal-enter flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 bg-accent text-white flex justify-between items-center shrink-0">
              <h3 className="text-xs font-black uppercase tracking-widest">Giao việc mới</h3>
              <button onClick={() => setIsTaskModalOpen(false)}><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  <BugAntIcon className="w-5 h-5 text-red-500" />
                  <span className="text-[10px] font-black text-slate-700 uppercase">Chế độ báo lỗi (BUG)</span>
                </div>
                <input name="isBug" type="checkbox" className="w-5 h-5 rounded accent-red-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dự án</label>
                <select required name="projectId" className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm bg-slate-50">
                  <option value="">-- Lựa chọn dự án --</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiêu đề</label>
                <input required name="title" className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm bg-slate-50" placeholder="Cần làm gì..." />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mô tả</label>
                <textarea name="description" rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm bg-slate-50" placeholder="Chi tiết quy trình..." />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><PhotoIcon className="w-4 h-4" /> Đính kèm ảnh ({previewImages.length})</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {previewImages.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden border border-slate-200">
                      <img src={img} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setPreviewImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><XMarkIcon className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <label className="w-20 h-20 shrink-0 border-2 border-dashed border-slate-200 rounded-md flex flex-col items-center justify-center text-slate-300 hover:text-accent hover:border-accent cursor-pointer">
                    <PlusIcon className="w-5 h-5" />
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Người thực hiện</label>
                  <select required name="assigneeId" className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm bg-slate-50">
                    <option value="">-- Chọn --</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hạn chót</label>
                  <input required name="deadline" type="date" className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm bg-slate-50 text-red-500" />
                </div>
              </div>
              <button type="submit" className="w-full py-3.5 bg-accent text-white rounded font-black text-sm uppercase tracking-widest mt-2">Kích hoạt quy trình</button>
            </form>
          </div>
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 z-[500] flex flex-col bg-white modal-enter overflow-hidden">
          <div className="h-14 md:h-16 px-4 md:px-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
            <div className="flex items-center gap-2 md:gap-4">
              <button onClick={() => setSelectedTask(null)} className="p-2 -ml-2 text-slate-400 hover:text-slate-900"><ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" /></button>
              <div className="hidden sm:block h-4 w-[1px] bg-slate-300 mx-2"></div>
              <div className="flex items-center gap-2 truncate">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: projects.find(p => p.id === selectedTask.projectId)?.color }}></div>
                <span className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] truncate">{projects.find(p => p.id === selectedTask.projectId)?.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-4">
              <button
                onClick={() => { if (confirm('Xóa công việc này?')) { handleDeleteTask(selectedTask.id); } }}
                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"
              >
                <TrashIcon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button onClick={() => setSelectedTask(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"><XMarkIcon className="w-5 h-5 md:w-6 md:h-6" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
            <div className="max-w-5xl mx-auto w-full px-4 md:px-8 py-8 md:py-16">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16">
                <div className="lg:col-span-2 space-y-8 md:space-y-12">
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex gap-3 items-center flex-wrap">
                      <StatusBadge task={selectedTask} />
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${selectedTask.priority === TaskPriority.HIGH ? 'bg-red-50 text-red-500 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{selectedTask.priority}</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">{selectedTask.title}</h2>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <h4 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-[0.3em] border-l-4 border-primary pl-4 md:pl-5">Nội dung yêu cầu</h4>
                    <div className="text-slate-600 leading-relaxed md:leading-[2] text-base md:text-lg whitespace-pre-wrap pl-4 md:pl-6">{selectedTask.description || 'Không có mô tả chi tiết cho nhiệm vụ này.'}</div>
                  </div>

                  {selectedTask.imageUrls && selectedTask.imageUrls.length > 0 && (
                    <div className="space-y-4 md:space-y-6">
                      <h4 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-[0.3em] border-l-4 border-accent pl-4 md:pl-5">Hình ảnh đính kèm ({selectedTask.imageUrls.length})</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3 pl-4 md:pl-6">
                        {selectedTask.imageUrls.map((img, i) => (
                          <div
                            key={i}
                            onClick={() => setLightboxIndex(i)}
                            className="group relative aspect-square rounded-xl overflow-hidden border border-slate-100 cursor-zoom-in hover:border-accent transition-all"
                          >
                            <img src={img} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <PlusIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
                  <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100 space-y-6 md:space-y-8">
                    <div>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Nhân sự phụ trách</p>
                      <div className="flex items-center gap-3 md:gap-4">
                        <img src={users.find(u => u.id === selectedTask.assigneeId)?.avatar} className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-white shadow-sm" />
                        <div>
                          <p className="font-bold text-slate-900 text-sm md:text-base">{users.find(u => u.id === selectedTask.assigneeId)?.name}</p>
                          <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase">{users.find(u => u.id === selectedTask.assigneeId)?.role}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:gap-6 pt-6 border-t border-slate-200/60">
                      <div>
                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 md:mb-2 flex items-center gap-2"><ClockIcon className="w-4 h-4" /> Thời hạn</p>
                        <p className="font-bold text-red-600 text-base md:text-lg">{new Date(selectedTask.deadline || '').toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div>
                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 md:mb-2 flex items-center gap-2"><CalendarDaysIcon className="w-4 h-4" /> Ngày khởi tạo</p>
                        <p className="font-bold text-slate-600 text-sm md:text-base">{new Date(selectedTask.createdAt || '').toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>

                    <div className="pt-4 md:pt-8">
                      {selectedTask.assigneeId === currentUser.id && selectedTask.status !== TaskStatus.DONE ? (
                        <button
                          onClick={() => handleMarkDone(selectedTask)}
                          className="w-full py-3 md:py-4 bg-emerald-600 text-white font-black text-[10px] md:text-sm rounded-xl shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                        >
                          <CheckIcon className="w-5 h-5 md:w-6 md:h-6" /> Hoàn thành
                        </button>
                      ) : (
                        <div className="p-3 md:p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center gap-3 text-emerald-700">
                          <CheckIcon className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Nhiệm vụ hoàn tất</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {lightboxIndex !== null && selectedTask?.imageUrls && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 md:top-8 md:right-8 z-[610] p-2 md:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
          >
            <XMarkIcon className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          <button
            onClick={() => setLightboxIndex(prev => prev! > 0 ? prev! - 1 : selectedTask.imageUrls!.length - 1)}
            className="absolute left-2 md:left-8 p-3 md:p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all"
          >
            <ChevronLeftIcon className="w-8 h-8 md:w-10 md:h-10" />
          </button>

          <button
            onClick={() => setLightboxIndex(prev => prev! < selectedTask.imageUrls!.length - 1 ? prev! + 1 : 0)}
            className="absolute right-2 md:right-8 p-3 md:p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all"
          >
            <ChevronRightIcon className="w-8 h-8 md:w-10 md:h-10" />
          </button>

          <div className="relative max-w-[95vw] md:max-w-[85vw] max-h-[85vh] select-none">
            <img
              src={selectedTask.imageUrls[lightboxIndex]}
              className="w-full h-full object-contain shadow-2xl animate-in zoom-in-90 duration-300"
              alt="Lightbox view"
            />
            <div className="absolute -bottom-10 md:-bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/60 font-black text-[10px] md:text-xs uppercase tracking-widest">
              <span>{lightboxIndex + 1}</span>
              <div className="w-6 md:w-8 h-[1px] bg-white/20"></div>
              <span>{selectedTask.imageUrls.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppShell;

