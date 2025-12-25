/**
 * Task API Routes
 * 
 * Xử lý các request cho task operations: PATCH (update), DELETE (remove)
 * Sử dụng optimized MongoDB connection từ lib/db.ts
 */

import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/db';
import { FindOneAndUpdateOptions, WithId } from 'mongodb';
import { Task, TaskStatus, TaskPriority, UserRole } from '@/types';
import { auth } from '@/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/tasks/[id]
 * 
 * Cập nhật một phần task fields (status, assigneeId, priority, etc.)
 * Chỉ update các fields được gửi trong body
 */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Thiếu ID công việc' }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await req.json() as Partial<Task>;
    const { tasks, projects } = await getCollections();
    
    // Kiểm tra task có tồn tại không
    const existingTask = await tasks.findOne({ id });
    if (!existingTask) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy công việc' }, { status: 404 });
    }

    // Employee chỉ có thể update tasks được assign cho họ
    if (session.user.role === UserRole.EMPLOYEE && existingTask.assigneeId !== session.user.id) {
      return NextResponse.json({ ok: false, error: 'Không có quyền cập nhật công việc này' }, { status: 403 });
    }

    // Validate allowed fields
    const allowedFields = ['status', 'assigneeId', 'priority', 'title', 'description', 'deadline', 'imageUrls', 'notes'];
    const updateData: Partial<Task> = {};
    
    for (const field of allowedFields) {
      if (field in body) {
        (updateData as any)[field] = body[field as keyof Task];
      }
    }

    // Employee không thể thay đổi deadline
    if (session.user.role === UserRole.EMPLOYEE && 'deadline' in updateData) {
      delete updateData.deadline;
    }

    // Nếu thay đổi assigneeId, kiểm tra project membership
    if (updateData.assigneeId && updateData.assigneeId !== existingTask.assigneeId) {
      const project = await projects.findOne({ id: existingTask.projectId });
      if (!project || !project.memberIds.includes(updateData.assigneeId)) {
        return NextResponse.json({ ok: false, error: 'Người được giao việc phải là thành viên của dự án' }, { status: 400 });
      }
    }

    // Validate status nếu có
    if (updateData.status && !Object.values(TaskStatus).includes(updateData.status as TaskStatus)) {
      return NextResponse.json({ ok: false, error: 'Status không hợp lệ' }, { status: 400 });
    }

    // Validate priority nếu có
    if (updateData.priority && !Object.values(TaskPriority).includes(updateData.priority as TaskPriority)) {
      return NextResponse.json({ ok: false, error: 'Priority không hợp lệ' }, { status: 400 });
    }

    // Update task
    const options: FindOneAndUpdateOptions = { returnDocument: 'after' };
    const res = await tasks.findOneAndUpdate(
      { id },
      { $set: updateData },
      options
    );
    
    const updated = res as unknown as { value?: WithId<Task> | null };
    
    if (!updated || !updated.value) {
      // Try to fetch the task again to see if update actually worked
      const checkTask = await tasks.findOne({ id });
      if (checkTask) {
        // Update actually worked, just returnDocument didn't return it
        return NextResponse.json({ ok: true, data: checkTask as Task });
      }
      
      return NextResponse.json({ ok: false, error: 'Không thể cập nhật công việc' }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true, data: updated.value });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể cập nhật công việc';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/**
 * PUT /api/tasks/[id]
 * 
 * Cập nhật toàn bộ task (legacy support)
 * Nên sử dụng PATCH thay vì PUT
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Thiếu ID công việc' }, { status: 400 });
    }

    const body = await req.json();
    const { tasks } = await getCollections();

    // Kiểm tra task có tồn tại không
    const existingTask = await tasks.findOne({ id });
    if (!existingTask) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy công việc' }, { status: 404 });
    }

    const options: FindOneAndUpdateOptions = { returnDocument: 'after' };
    const res = await tasks.findOneAndUpdate(
      { id },
      { $set: body },
      options
    );
    
    const updated = res as unknown as { value?: WithId<Task> | null };
    
    if (!updated || !updated.value) {
      return NextResponse.json({ ok: false, error: 'Không thể cập nhật công việc' }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true, data: updated.value });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể cập nhật công việc';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/[id]
 * 
 * Xóa task theo ID
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Thiếu ID công việc' }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { tasks } = await getCollections();
    const existingTask = await tasks.findOne({ id });
    
    if (!existingTask) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy công việc' }, { status: 404 });
    }

    // Employee không thể xóa tasks
    if (session.user.role === UserRole.EMPLOYEE) {
      return NextResponse.json({ ok: false, error: 'Không có quyền xóa công việc' }, { status: 403 });
    }

    const res = await tasks.deleteOne({ id });
    
    if (res.deletedCount === 0) {
      return NextResponse.json({ ok: false, error: 'Không thể xóa công việc' }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể xóa công việc';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

