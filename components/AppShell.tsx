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

const fetchJson = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok || data?.ok === false) {
    const message = data?.error || res.statusText;
    throw new Error(message);
  }
  return data;
};

const SearchableUserSelect = ({ users, selectedIds, onChange, label }: any) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = users.filter((u: User) => u.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative space-y-1" ref={containerRef}>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">{label}</label>
      <div
        className="w-full min-h-[42px] p-1.5 border border-slate-200 rounded-md bg-white flex flex-wrap gap-1.5 cursor-pointer hover:border-accent transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedIds.length === 0 && <span className="text-slate-400 text-sm py-1 px-2">Tìm kiếm & Chọn nhân sự...</span>}
        {selectedIds.map((id: string) => {
          const user = users.find((u: User) => u.id === id);
          return (
            <div key={id} className="bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1.5 text-xs font-bold">
              <img src={user?.avatar} className="w-4 h-4 rounded-full" />
              {user?.name}
              <XMarkIcon className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={(e) => { e.stopPropagation(); onChange(selectedIds.filter((x: string) => x !== id)); }} />
            </div>
          );
        })}
      </div>
      {isOpen && (
        <div className="absolute z-[250] top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-2xl max-h-60 overflow-y-auto custom-scrollbar modal-enter">
          <div className="p-2 sticky top-0 bg-white border-b border-slate-100">
            <input
              autoFocus
              className="w-full px-3 py-2 text-sm border-none focus:ring-0"
              placeholder="Nhập tên..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          </div>
          {filtered.map((u: User) => (
            <div
              key={u.id}
              className={`p-3 text-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 ${selectedIds.includes(u.id) ? 'bg-blue-50 text-blue-600' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (selectedIds.includes(u.id)) onChange(selectedIds.filter((x: string) => x !== u.id));
                else onChange([...selectedIds, u.id]);
              }}
            >
              <img src={u.avatar} className="w-6 h-6 rounded-full" />
              <div className="flex-1 font-medium">{u.name}</div>
              {selectedIds.includes(u.id) && <CheckIcon className="w-4 h-4" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const boardColumns = [
  { id: 'overdue', label: 'Quá hạn', color: '#EF4444' },
  { id: 'today', label: 'Hôm nay', color: '#10B981' },
  { id: 'thisWeek', label: 'Tuần này', color: '#3B82F6' },
  { id: 'later', label: 'Sắp tới', color: '#6366F1' },
  { id: 'done', label: 'Đã xong', color: '#94A3B8' }
];

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
  const kanbanRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setAuthError(null);
    try {
      const res = await fetchJson<{ ok: true; data: User }>('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: f.get('email'), password: f.get('password') })
      });
      setCurrentUser(res.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đăng nhập thất bại';
      setAuthError(message);
    }
  };

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

  const StatusBadge = ({ task }: { task: Task }) => {
    if (task.status === TaskStatus.BUG) return <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded text-[9px] font-black border border-red-100 flex items-center gap-1 uppercase"><BugAntIcon className="w-3 h-3" /> Lỗi</span>;
    if (task.status === TaskStatus.DONE) return <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-black border border-emerald-100 uppercase tracking-wider">Xong</span>;
    return <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded text-[9px] font-black border border-slate-100 uppercase tracking-wider">{task.status}</span>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-sm">Đang tải dữ liệu...</p>
          {globalError && <p className="text-red-300 text-xs">{globalError}</p>}
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-sm p-10 rounded-lg shadow-2xl modal-enter">
          <div className="text-center mb-10">
            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black mx-auto mb-4">D</div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">D-Line Workflows</h1>
            <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Enterprise ERP</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input required name="email" type="email" placeholder="Email" className="w-full px-4 py-3 border border-slate-200 rounded text-sm bg-slate-50 focus:bg-white transition-all" />
            <input required name="password" type="password" placeholder="Mật khẩu" className="w-full px-4 py-3 border border-slate-200 rounded text-sm bg-slate-50 focus:bg-white transition-all" />
            <button className="w-full py-3.5 bg-slate-900 text-white rounded font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">Đăng nhập</button>
          </form>
          {authError && <p className="text-red-500 text-xs mt-4 text-center">{authError}</p>}
          {users.length === 0 && (
            <p className="text-[11px] text-slate-500 text-center mt-4">
              Chưa có user trong DB. Tạo mới bằng API /api/users (POST) rồi đăng nhập.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden relative">
      <aside className="hidden md:flex w-64 bg-primary flex-col shrink-0">
        <div className="p-8 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 bg-accent rounded flex items-center justify-center text-white font-black">D</div>
          <span className="text-white font-bold tracking-tight">D-LINE PRO</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar">
          <button onClick={() => { setActiveTab('dashboard'); setSelectedProjectId(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <HomeIcon className="w-5 h-5" /> Tổng quan
          </button>
          <button onClick={() => { setActiveTab('projects'); setSelectedProjectId(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${activeTab === 'projects' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <BriefcaseIcon className="w-5 h-5" /> Dự án
          </button>
          <button onClick={() => { setActiveTab('tasks'); setSelectedProjectId(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${activeTab === 'tasks' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Squares2X2Icon className="w-5 h-5" /> Công việc
          </button>
          <button onClick={() => { setActiveTab('team'); setSelectedProjectId(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${activeTab === 'team' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <UserGroupIcon className="w-5 h-5" /> Nhân sự
          </button>

          <div className="pt-8 px-4 pb-2"><span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Dự án tham gia</span></div>
          <div className="space-y-0.5">
            {projects.map(p => (
              <button key={p.id} onClick={() => { setSelectedProjectId(p.id); setActiveTab('tasks'); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded text-xs transition-all ${selectedProjectId === p.id ? 'text-white font-bold bg-white/5' : 'text-slate-500 hover:text-white'}`}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }}></div> {p.name}
              </button>
            ))}
          </div>
        </nav>
        <div className="p-4 bg-[#0A0F1E] flex items-center gap-3">
          <img src={currentUser.avatar} className="w-9 h-9 rounded-full border border-white/10" alt="" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white font-bold truncate">{currentUser.name}</p>
            <p className="text-[9px] text-slate-500 uppercase font-black">{currentUser.role}</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><ArrowRightOnRectangleIcon className="w-5 h-5" /></button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-10 shrink-0">
          <div className="flex items-center gap-3">
            {selectedProjectId && <button onClick={() => setSelectedProjectId(null)} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors"><ChevronLeftIcon className="w-5 h-5" /></button>}
            <h2 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-[0.2em]">
              {selectedProjectId ? projects.find(p => p.id === selectedProjectId)?.name : activeTab}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative group hidden sm:block">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" />
              <input type="text" placeholder="Tìm kiếm..." className="bg-slate-100 border-none rounded-md pl-9 pr-4 py-2 text-xs w-32 md:w-72 focus:w-40 md:focus:w-72 focus:bg-white focus:ring-1 focus:ring-accent transition-all" />
            </div>
            {activeTab === 'projects' && <button onClick={() => setIsProjectModalOpen(true)} className="bg-primary text-white p-2 md:px-4 md:py-2 rounded md:rounded-md text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"><FolderPlusIcon className="w-5 h-5 md:w-4 md:h-4" /><span className="hidden md:inline">Dự án mới</span></button>}
            {activeTab === 'team' && <button onClick={() => setIsUserModalOpen(true)} className="bg-primary text-white p-2 md:px-4 md:py-2 rounded md:rounded-md text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"><PlusIcon className="w-5 h-5 md:w-4 md:h-4" /><span className="hidden md:inline">Nhân sự mới</span></button>}
            {(activeTab === 'tasks' || selectedProjectId) && <button onClick={() => setIsTaskModalOpen(true)} className="bg-accent text-white p-2 md:px-4 md:py-2 rounded md:rounded-md text-xs font-bold flex items-center gap-2 hover:bg-blue-600 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"><PlusIcon className="w-5 h-5 md:w-4 md:h-4" /><span className="hidden md:inline">Giao việc mới</span></button>}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-10 pb-24 md:pb-10">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 md:space-y-10 modal-enter max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                  { label: 'Dự án đang chạy', val: projects.length, icon: BriefcaseIcon, color: 'text-slate-900', bg: 'bg-white' },
                  { label: 'Tổng công việc', val: tasks.length, icon: Squares2X2Icon, color: 'text-blue-600', bg: 'bg-white' },
                  { label: 'Việc hoàn thành', val: tasks.filter(t => t.status === TaskStatus.DONE).length, icon: CheckIcon, color: 'text-emerald-600', bg: 'bg-white' },
                  { label: 'Tổng lỗi (Bugs)', val: tasks.filter(t => t.status === TaskStatus.BUG).length, icon: BugAntIcon, color: 'text-red-500', bg: 'bg-white' }
                ].map((s, i) => (
                  <div key={i} className={`${s.bg} p-6 md:p-8 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-accent transition-all`}>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><s.icon className={`w-5 h-5 md:w-6 md:h-6 ${s.color}`} /></div>
                    <p className="text-2xl md:text-3xl font-black text-slate-900">{s.val}</p>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white p-6 md:p-8 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6 md:mb-8">
                  <h3 className="font-black text-slate-900 text-[10px] md:text-sm uppercase tracking-widest">Tình trạng công việc gần nhất</h3>
                  <button className="text-[9px] md:text-[10px] font-bold text-accent hover:underline uppercase">Tất cả</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {tasks.filter(t => t.status !== TaskStatus.DONE).slice(0, 5).map(t => (
                    <div key={t.id} onClick={() => setSelectedTask(t)} className="flex items-center justify-between py-4 md:py-5 hover:bg-slate-50 px-2 md:px-4 md:-mx-4 transition-all cursor-pointer group rounded-md">
                      <div className="flex items-center gap-3 md:gap-5 min-w-0">
                        <StatusBadge task={t} />
                        <p className="text-xs md:text-sm font-bold text-slate-700 truncate group-hover:text-accent">{t.title}</p>
                      </div>
                      <div className="flex items-center gap-4 md:gap-8 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-[9px] font-black text-slate-300 uppercase">Deadline</p>
                          <p className="text-xs font-bold text-slate-500">{new Date(t.deadline || '').toLocaleDateString('vi-VN')}</p>
                        </div>
                        <img src={users.find(u => u.id === t.assigneeId)?.avatar} className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-slate-100 shadow-sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 modal-enter max-w-7xl mx-auto">
              {projects.map(p => (
                <div key={p.id} onClick={() => { setSelectedProjectId(p.id); setActiveTab('tasks'); }} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col">
                  <div className="h-1 w-full" style={{ backgroundColor: p.color }}></div>
                  <div className="p-6 md:p-8-1">
                    <div className="flex justify-between items-start mb-4 md:mb-6">
                      <div className="p-2 bg-slate-50 rounded group-hover:bg-accent/5 transition-colors"><BriefcaseIcon className="w-5 h-5 md:w-6 md:h-6 text-slate-300 group-hover:text-accent" /></div>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black rounded border border-blue-100 uppercase tracking-widest">Active</span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 group-hover:text-accent transition-colors">{p.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-6 md:mb-10">{p.description}</p>
                    <div className="flex justify-between items-center pt-6 md:pt-8 border-t border-slate-50">
                      <div className="flex -space-x-2">
                        {p.memberIds.slice(0, 3).map(mid => <img key={mid} src={users.find(u => u.id === mid)?.avatar} className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white shadow-sm" />)}
                        {p.memberIds.length > 3 && <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-100 flex items-center justify-center text-[8px] md:text-[9px] font-bold text-slate-400 border-2 border-white">+{p.memberIds.length - 3}</div>}
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-300 uppercase">Hạn</p>
                        <p className="text-xs font-bold text-slate-800">{new Date(p.deadline || '').toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="h-full flex flex-col modal-enter relative">
              <div
                className={`flex gap-4 md:gap-6 overflow-x-auto pb-10 custom-scrollbar grab-scroll ${isScrolling ? 'cursor-grabbing' : 'cursor-grab'}`}
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
                        <span className="text-xs font-black text-slate-600 uppercase tracking-[0.15em]">{col.label}</span>
                        <span className="bg-slate-200/60 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-black">{kanbanGroups[col.id]?.length || 0}</span>
                      </div>
                    </div>
                    <div className="flex-1 bg-slate-200/30 rounded-lg p-3 space-y-3 md:space-y-4 min-h-[500px] border border-slate-200/40">
                      {kanbanGroups[col.id]?.map(task => (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            if (isScrolling) return;
                            setSelectedTask(task);
                          }}
                          className="bg-white p-4 md:p-5 rounded-md border border-slate-200 shadow-sm hover:border-accent transition-all cursor-pointer group"
                        >
                          <div className="flex justify-between items-start mb-3 md:mb-4">
                            <StatusBadge task={task} />
                            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${task.priority === TaskPriority.HIGH ? 'bg-red-50 text-red-500 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{task.priority}</div>
                          </div>
                          <h4 className="text-[13px] font-bold text-slate-800 mb-4 md:mb-5 leading-relaxed line-clamp-2 group-hover:text-accent transition-colors">{task.title}</h4>
                          <div className="flex justify-between items-center mt-auto">
                            <div className="flex items-center gap-2">
                              <img src={users.find(u => u.id === task.assigneeId)?.avatar} className="w-7 h-7 rounded-full border border-slate-100 shadow-sm" />
                              {task.imageUrls && task.imageUrls.length > 0 && <span className="flex items-center gap-1 text-slate-300"><PhotoIcon className="w-3.5 h-3.5" /></span>}
                            </div>
                            <span className={`text-[10px] font-bold flex items-center gap-1 ${col.id === 'overdue' ? 'text-red-500' : 'text-slate-400'}`}>
                              {new Date(task.deadline || '').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 modal-enter max-w-7xl mx-auto">
              {users.map(u => {
                const workload = tasks.filter(t => t.assigneeId === u.id && t.status !== TaskStatus.DONE).length;
                return (
                  <div key={u.id} className="bg-white p-6 md:p-8 rounded-lg border border-slate-200 shadow-sm text-center group hover:border-accent transition-all">
                    <img src={u.avatar} className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-6 border-4 border-slate-50 shadow-inner" />
                    <h4 className="font-bold text-slate-900 group-hover:text-accent">{u.name}</h4>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest">{u.role}</p>
                    <div className="pt-6 border-t border-slate-50 flex justify-around">
                      <div className="text-center">
                        <p className="text-lg md:text-xl font-black text-slate-900">{workload}</p>
                        <p className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase">Đang làm</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg md:text-xl font-black text-slate-900">{tasks.filter(t => t.assigneeId === u.id && t.status === TaskStatus.DONE).length}</p>
                        <p className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase">Xong</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-2 z-40">
        <button
          onClick={() => { setActiveTab('dashboard'); setSelectedProjectId(null); }}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${activeTab === 'dashboard' ? 'text-accent' : 'text-slate-400'}`}
        >
          <HomeIcon className="w-6 h-6" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Tổng quan</span>
        </button>
        <button
          onClick={() => { setActiveTab('projects'); setSelectedProjectId(null); }}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${activeTab === 'projects' ? 'text-accent' : 'text-slate-400'}`}
        >
          <BriefcaseIcon className="w-6 h-6" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Dự án</span>
        </button>
        <button
          onClick={() => { setActiveTab('tasks'); setSelectedProjectId(null); }}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${activeTab === 'tasks' ? 'text-accent' : 'text-slate-400'}`}
        >
          <Squares2X2Icon className="w-6 h-6" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Công việc</span>
        </button>
        <button
          onClick={() => { setActiveTab('team'); setSelectedProjectId(null); }}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${activeTab === 'team' ? 'text-accent' : 'text-slate-400'}`}
        >
          <UserGroupIcon className="w-6 h-6" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Nhân sự</span>
        </button>
      </nav>

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

