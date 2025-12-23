
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee'
}

export enum TaskStatus {
  NEW = 'new',
  BUG = 'bug',
  IN_PROGRESS = 'in-progress',
  FIXED = 'fixed',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email: string;
  password?: string;
}

export interface Employee extends User {
  department?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  status: 'active' | 'completed' | 'on-hold';
  startDate: string;
  deadline?: string;
  color: string;
  createdAt: string;
  managerId: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string;
  startDate: string;
  deadline?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  imageUrls?: string[]; // Danh sách ảnh đính kèm (bug)
}
