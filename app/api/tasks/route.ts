import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/db';
import { Task, TaskPriority, TaskStatus, UserRole } from '@/types';
import { auth } from '@/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    const { tasks } = await getCollections();
    
    // Nếu là Employee, chỉ trả về tasks được assign cho họ
    if (session?.user?.role === UserRole.EMPLOYEE) {
      const data = await tasks.find({ assigneeId: session.user.id }).toArray();
      return NextResponse.json({ ok: true, data });
    }
    
    // Admin và Manager xem tất cả tasks
    const data = await tasks.find().toArray();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể lấy danh sách tasks';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await req.json();
    const {
      projectId,
      title,
      description = '',
      assigneeId,
      startDate,
      deadline,
      status = TaskStatus.NEW,
      priority = TaskPriority.MEDIUM,
      imageUrls
    } = body as Partial<Task>;

    if (!projectId || !title) {
      return NextResponse.json({ ok: false, error: 'Thiếu projectId hoặc title' }, { status: 400 });
    }

    // Kiểm tra project membership
    const { projects, tasks } = await getCollections();
    const project = await projects.findOne({ id: projectId });
    if (!project) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy dự án' }, { status: 404 });
    }

    // Xác định assigneeId
    let finalAssigneeId = assigneeId;
    
    // Nếu là Employee, tự động assign cho chính họ
    if (session.user.role === UserRole.EMPLOYEE) {
      finalAssigneeId = session.user.id;
    } else if (!finalAssigneeId) {
      return NextResponse.json({ ok: false, error: 'Thiếu assigneeId' }, { status: 400 });
    }

    // Kiểm tra assignee có phải là member của project không
    if (!project.memberIds.includes(finalAssigneeId)) {
      return NextResponse.json({ ok: false, error: 'Người được giao việc phải là thành viên của dự án' }, { status: 400 });
    }

    // deadline là optional
    const id = crypto.randomUUID();
    const task: Task = {
      id,
      projectId,
      title,
      description,
      assigneeId: finalAssigneeId,
      startDate: startDate || new Date().toISOString().split('T')[0],
      deadline, // Optional
      status,
      priority,
      createdAt: new Date().toISOString(),
      imageUrls,
      notes: [] // Initialize notes array
    };

    await tasks.insertOne(task);
    return NextResponse.json({ ok: true, data: task });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể tạo công việc';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

