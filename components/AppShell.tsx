'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
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
import { useSession } from 'next-auth/react';
import { Project, Task, TaskPriority, TaskStatus, User, UserRole } from '@/types';

// UI Components - Import từ thư mục ui
import { Loading, PasswordInput } from '@/ui/components';
import { SearchableSelect } from '@/ui/components/SearchableSelect';
import { AvatarSelector } from '@/ui/components/AvatarSelector';
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
import { renderTextWithLinks } from '@/ui/utils/linkUtils';

// Kanban board columns configuration đã được move vào TasksView component

const AppShell: React.FC = () => {
  // Sử dụng NextAuth session thay vì localStorage
  const { data: session, status } = useSession();
  
  // Convert session user thành User type - sử dụng useMemo để tránh tạo object mới mỗi lần render
  const currentUser: User | null = useMemo(() => {
    if (!session?.user) return null;
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      avatar: session.user.avatar
    };
  }, [session?.user?.id, session?.user?.name, session?.user?.email, session?.user?.role, session?.user?.avatar]);

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
  const [newTaskForm, setNewTaskForm] = useState<{
    projectId: string;
    title: string;
    description: string;
    assigneeId: string;
    deadline: string;
    priority: TaskPriority;
    isBug: boolean;
  }>({
    projectId: '',
    title: '',
    description: '',
    assigneeId: '',
    deadline: '',
    priority: TaskPriority.MEDIUM,
    isBug: false
  });
  // Kanban drag state đã được move vào TasksView component
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserRole, setNewUserRole] = useState<string>(UserRole.EMPLOYEE);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  
  // Ref để track xem đã load data chưa, tránh load lại không cần thiết
  const hasLoadedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  // Load data from API - chỉ load khi đã có session (đã đăng nhập)
  useEffect(() => {
    // Chỉ load data khi session đã được load và có user
    // Và chỉ load một lần cho mỗi user (tránh reload khi component re-render)
    if (status === 'authenticated' && currentUser) {
      // Chỉ load nếu chưa load hoặc user đã thay đổi
      if (!hasLoadedRef.current || userIdRef.current !== currentUser.id) {
        hasLoadedRef.current = true;
        userIdRef.current = currentUser.id;
        
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
      }
    } else if (status === 'unauthenticated') {
      // Reset khi logout
      hasLoadedRef.current = false;
      userIdRef.current = null;
      setIsLoading(false);
    }
  }, [status, currentUser?.id]); // Chỉ depend vào status và user ID, không phải toàn bộ currentUser object

  // Kanban drag handlers đã được move vào TasksView component

  // Logout được xử lý bởi LogoutButton component (sử dụng NextAuth signOut)
  // Không cần handleLogout function nữa

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
    try {
      const payload = {
        projectId: newTaskForm.projectId,
        title: newTaskForm.title,
        description: newTaskForm.description,
        assigneeId: newTaskForm.assigneeId,
        startDate: new Date().toISOString(),
        deadline: newTaskForm.deadline,
        status: (newTaskForm.isBug ? TaskStatus.BUG : TaskStatus.NEW) as TaskStatus,
        priority: newTaskForm.priority,
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
      setNewTaskForm({ projectId: '', title: '', description: '', assigneeId: '', deadline: '', priority: TaskPriority.MEDIUM, isBug: false });
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
      role: newUserRole || UserRole.EMPLOYEE,
      avatar: selectedAvatar || undefined
    };
    try {
      const res = await fetchJson<{ ok: true; data: User }>('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setUsers(prev => [...prev, res.data]);
      setIsUserModalOpen(false);
      setNewUserRole(UserRole.EMPLOYEE);
      setSelectedAvatar('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Không tạo được nhân sự');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkDone = async (task: Task) => {
    if (!task || !task.id) {
      alert('Công việc không hợp lệ');
      return;
    }

    try {
      const url = `/api/tasks/${encodeURIComponent(task.id)}`;
      
      // Sử dụng PATCH để chỉ update status
      const res = await fetchJson<{ ok: true; data: Task }>(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: TaskStatus.DONE })
      });
      
      // Cập nhật task trong state
      setTasks(prev => prev.map(t => (t.id === task.id ? res.data : t)));
      
      // Cập nhật selectedTask nếu đang xem task này
      if (selectedTask && selectedTask.id === task.id) {
        setSelectedTask(res.data);
      }
    } catch (error) {
      console.error('Error marking task as done:', error);
      const message = error instanceof Error ? error.message : 'Không cập nhật được công việc';
      alert(`Lỗi: ${message}\n\nVui lòng thử lại hoặc reload trang.`);
    }
  };

  const filteredTasks = useMemo(() => {
    return selectedProjectId ? tasks.filter(t => t.projectId === selectedProjectId) : tasks;
  }, [tasks, selectedProjectId]);

  // StatusBadge đã được tách thành component riêng trong ui/features/tasks/StatusBadge.tsx

  // Hiển thị loading khi đang check session hoặc đang load data
  if (status === 'loading' || (isLoading && status === 'authenticated')) {
    return <Loading message="Đang tải dữ liệu..." error={globalError} fullScreen />;
  }

  // Nếu chưa authenticated thì hiển thị LoginForm
  if (status === 'unauthenticated' || !currentUser) {
    return <LoginForm />;
  }

  // Nếu đã authenticated thì hiển thị ứng dụng

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
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - sử dụng Header component */}
        <Header
          activeTab={activeTab}
          selectedProjectId={selectedProjectId}
          projects={projects}
          currentUserRole={currentUser?.role}
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
              tasks={filteredTasks}
              users={users}
              onTaskClick={setSelectedTask}
              onTaskUpdate={(updatedTask) => {
                // Update task in state
                setTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));
                // Update selectedTask if it's the one being updated
                if (selectedTask && selectedTask.id === updatedTask.id) {
                  setSelectedTask(updatedTask);
                }
              }}
            />
          )}

          {/* Team View */}
          {activeTab === 'team' && (
            <TeamView 
              users={users} 
              tasks={tasks}
              currentUserRole={currentUser?.role}
              onDeleteUser={async (userId) => {
                try {
                  await fetchJson(`/api/users/${userId}`, { method: 'DELETE' });
                  setUsers(prev => prev.filter(u => u.id !== userId));
                } catch (error) {
                  alert(error instanceof Error ? error.message : 'Không xóa được người dùng');
                }
              }}
            />
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
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => { setIsUserModalOpen(false); setNewUserRole(UserRole.EMPLOYEE); setSelectedAvatar(''); }}>
          <div className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden modal-enter max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 bg-primary text-white flex justify-between items-center shrink-0">
              <h3 className="text-xs font-black uppercase tracking-widest">Thêm nhân sự</h3>
              <button onClick={() => { setIsUserModalOpen(false); setNewUserRole(UserRole.EMPLOYEE); setSelectedAvatar(''); }}><XMarkIcon className="w-6 h-6" /></button>
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
              <PasswordInput
                required
                name="password"
                placeholder="******"
                label="Mật khẩu"
              />
              <SearchableSelect
                label="Vai trò"
                name="role"
                options={[
                  { value: UserRole.EMPLOYEE, label: 'Nhân viên' },
                  { value: UserRole.MANAGER, label: 'Quản lý' },
                  { value: UserRole.ADMIN, label: 'Quản trị viên' }
                ]}
                value={newUserRole}
                onChange={(value) => setNewUserRole(value)}
                placeholder="Tìm kiếm vai trò..."
              />
              <AvatarSelector
                label="Avatar"
                selectedAvatar={selectedAvatar}
                onSelect={setSelectedAvatar}
              />
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
        <div className="fixed inset-0 z-[500] flex flex-col bg-white modal-enter overflow-hidden">
          <div className="h-14 md:h-16 px-4 md:px-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
            <div className="flex items-center gap-2 md:gap-4">
              <button onClick={() => { setIsTaskModalOpen(false); setNewTaskForm({ projectId: '', title: '', description: '', assigneeId: '', deadline: '', priority: TaskPriority.MEDIUM, isBug: false }); setPreviewImages([]); }} className="p-2 -ml-2 text-slate-400 hover:text-slate-900"><ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" /></button>
              <div className="hidden sm:block h-4 w-[1px] bg-slate-300 mx-2"></div>
              <h2 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Giao việc mới</h2>
            </div>
            <div className="flex items-center gap-1 md:gap-4">
              <button onClick={() => { setIsTaskModalOpen(false); setNewTaskForm({ projectId: '', title: '', description: '', assigneeId: '', deadline: '', priority: TaskPriority.MEDIUM, isBug: false }); setPreviewImages([]); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"><XMarkIcon className="w-5 h-5 md:w-6 md:h-6" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
            <div className="max-w-5xl mx-auto w-full px-4 md:px-8 py-8 md:py-16">
              <form onSubmit={handleCreateTask} className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16">
                <div className="lg:col-span-2 space-y-8 md:space-y-12">
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex gap-3 items-center flex-wrap">
                      <select 
                        name="priority" 
                        className="px-3 py-1.5 border border-slate-200 rounded text-xs bg-white"
                        value={newTaskForm.priority}
                        onChange={(e) => setNewTaskForm(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                      >
                        <option value={TaskPriority.LOW}>Thấp</option>
                        <option value={TaskPriority.MEDIUM}>Trung bình</option>
                        <option value={TaskPriority.HIGH}>Cao</option>
                      </select>
                    </div>
                    <SearchableSelect
                      label="Dự án"
                      name="projectId"
                      required
                      options={[
                        { value: '', label: '-- Lựa chọn dự án --' },
                        ...projects.map(p => ({ value: p.id, label: p.name }))
                      ]}
                      value={newTaskForm.projectId}
                      onChange={(value) => setNewTaskForm(prev => ({ ...prev, projectId: value }))}
                      placeholder="Tìm kiếm dự án..."
                    />
                    <input 
                      required 
                      name="title" 
                      className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm bg-slate-50 text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight" 
                      placeholder="Tiêu đề công việc..." 
                      value={newTaskForm.title}
                      onChange={(e) => setNewTaskForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <h4 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-[0.3em] border-l-4 border-primary pl-4 md:pl-5">Nội dung yêu cầu</h4>
                    <textarea 
                      name="description" 
                      rows={8} 
                      className="w-full px-4 md:px-6 py-2.5 border border-slate-200 rounded text-sm md:text-base bg-slate-50 text-slate-600 leading-relaxed md:leading-[2] whitespace-pre-wrap" 
                      placeholder="Chi tiết quy trình... (Có thể dán link: https://example.com)" 
                      value={newTaskForm.description}
                      onChange={(e) => setNewTaskForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <h4 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-[0.3em] border-l-4 border-accent pl-4 md:pl-5">Hình ảnh đính kèm ({previewImages.length})</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3 pl-4 md:pl-6">
                      {previewImages.map((img, i) => (
                        <div
                          key={i}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-slate-100 cursor-pointer hover:border-accent transition-all"
                        >
                          <img src={img} className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setPreviewImages(prev => prev.filter((_, idx) => idx !== i))} 
                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-300 hover:text-accent hover:border-accent cursor-pointer transition-colors">
                        <PlusIcon className="w-5 h-5 md:w-6 md:h-6" />
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
                  <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100 space-y-6 md:space-y-8">
                    <div>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Người thực hiện</p>
                      <SearchableSelect
                        name="assigneeId"
                        required
                        options={[
                          { value: '', label: '-- Chọn --' },
                          ...users.map(u => ({ value: u.id, label: u.name }))
                        ]}
                        value={newTaskForm.assigneeId}
                        onChange={(value) => setNewTaskForm(prev => ({ ...prev, assigneeId: value }))}
                        placeholder="Tìm kiếm người dùng..."
                      />
                      {newTaskForm.assigneeId && (
                        <div className="flex items-center gap-3 md:gap-4 mt-4">
                          <img src={users.find(u => u.id === newTaskForm.assigneeId)?.avatar} className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-white shadow-sm" />
                          <div>
                            <p className="font-bold text-slate-900 text-sm md:text-base">{users.find(u => u.id === newTaskForm.assigneeId)?.name}</p>
                            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase">{users.find(u => u.id === newTaskForm.assigneeId)?.role}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:gap-6 pt-6 border-t border-slate-200/60">
                      <div>
                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 md:mb-2 flex items-center gap-2"><ClockIcon className="w-4 h-4" /> Thời hạn</p>
                        <input 
                          required 
                          name="deadline" 
                          type="date" 
                          className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm bg-white font-bold text-red-600 text-base md:text-lg" 
                          value={newTaskForm.deadline}
                          onChange={(e) => setNewTaskForm(prev => ({ ...prev, deadline: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="pt-4 md:pt-8">
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full py-3 md:py-4 bg-accent text-white font-black text-[10px] md:text-sm rounded-xl shadow-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-60"
                      >
                        {isSubmitting ? 'Đang tạo...' : 'Kích hoạt quy trình'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
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
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${selectedTask.priority === TaskPriority.HIGH ? 'bg-red-50 text-red-500 border-red-100' : selectedTask.priority === TaskPriority.MEDIUM ? 'bg-yellow-50 text-yellow-500 border-yellow-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        {selectedTask.priority === TaskPriority.HIGH ? 'Cao' : selectedTask.priority === TaskPriority.MEDIUM ? 'Trung bình' : 'Thấp'}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">{selectedTask.title}</h2>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <h4 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-[0.3em] border-l-4 border-primary pl-4 md:pl-5">Nội dung yêu cầu</h4>
                    <div className="text-slate-600 leading-relaxed md:leading-[2] text-base md:text-lg whitespace-pre-wrap pl-4 md:pl-6">
                      {selectedTask.description ? renderTextWithLinks(selectedTask.description) : 'Không có mô tả chi tiết cho nhiệm vụ này.'}
                    </div>
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
                      {selectedTask.assigneeId === currentUser?.id && selectedTask.status !== TaskStatus.DONE ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedTask) {
                              handleMarkDone(selectedTask);
                            }
                          }}
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
              alt="Xem ảnh"
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

