import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/db';
import { FindOneAndUpdateOptions, WithId } from 'mongodb';
import { Project } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { projects } = await getCollections();
    const options: FindOneAndUpdateOptions = { returnDocument: 'after' };
    const res = await projects.findOneAndUpdate(
      { id },
      { $set: body },
      options
    );
    const updated = res as unknown as { value?: WithId<Project> | null };
    if (!updated || !updated.value) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy dự án' }, { status: 404 });
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

