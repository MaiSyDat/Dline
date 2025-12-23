import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/db';

type Params = { params: { id: string } };

export async function PUT(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const { projects } = await getCollections();
    const res = await projects.findOneAndUpdate(
      { id: params.id },
      { $set: body },
      { returnDocument: 'after' }
    );
    if (!res.value) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy dự án' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, data: res.value });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể cập nhật dự án';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { projects, tasks } = await getCollections();
    await tasks.deleteMany({ projectId: params.id });
    const res = await projects.deleteOne({ id: params.id });
    if (res.deletedCount === 0) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy dự án' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể xóa dự án';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

