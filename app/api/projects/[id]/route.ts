import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/db';
import { FindOneAndUpdateOptions, WithId } from 'mongodb';
import { Project } from '@/types';
import { auth } from '@/auth';
import { isAdminOrManager } from '@/lib/permissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Thiếu ID dự án' }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    // Chỉ Admin và Manager có thể cập nhật project
    if (!isAdminOrManager(session.user.role)) {
      return NextResponse.json({ ok: false, error: 'Không có quyền cập nhật dự án' }, { status: 403 });
    }

    const body = await req.json();
    const { projects } = await getCollections();
    
    // Kiểm tra project có tồn tại không
    const existingProject = await projects.findOne({ id });
    if (!existingProject) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy dự án' }, { status: 404 });
    }

    const options: FindOneAndUpdateOptions = { returnDocument: 'after' };
    const res = await projects.findOneAndUpdate(
      { id },
      { $set: body },
      options
    );
    const updated = res as unknown as { value?: WithId<Project> | null };
    if (!updated || !updated.value) {
      // Try to fetch the project again to see if update actually worked
      const checkProject = await projects.findOne({ id });
      if (checkProject) {
        return NextResponse.json({ ok: true, data: checkProject });
      }
      return NextResponse.json({ ok: false, error: 'Không thể cập nhật dự án' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, data: updated.value });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể cập nhật dự án';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    // Chỉ Admin và Manager có thể xóa project
    if (!isAdminOrManager(session.user.role)) {
      return NextResponse.json({ ok: false, error: 'Không có quyền xóa dự án' }, { status: 403 });
    }

    const { projects, tasks } = await getCollections();
    await tasks.deleteMany({ projectId: id });
    const res = await projects.deleteOne({ id });
    if (res.deletedCount === 0) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy dự án' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể xóa dự án';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

