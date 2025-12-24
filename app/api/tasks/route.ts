import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/db';
import { Task, TaskPriority, TaskStatus } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { tasks } = await getCollections();
    const data = await tasks.find().toArray();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể lấy danh sách tasks';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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

    if (!projectId || !title || !assigneeId || !deadline) {
      return NextResponse.json({ ok: false, error: 'Thiếu projectId/title/assigneeId/deadline' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const task: Task = {
      id,
      projectId,
      title,
      description,
      assigneeId,
      startDate: startDate || new Date().toISOString().split('T')[0],
      deadline,
      status,
      priority,
      createdAt: new Date().toISOString(),
      imageUrls
    };

    const { tasks } = await getCollections();
    await tasks.insertOne(task);
    return NextResponse.json({ ok: true, data: task });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể tạo công việc';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

