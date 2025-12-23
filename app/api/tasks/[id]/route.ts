import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/db';

type Params = { params: { id: string } };

export async function PUT(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const { tasks } = await getCollections();
    const res = await tasks.findOneAndUpdate(
      { id: params.id },
      { $set: body },
      { returnDocument: 'after' }
    );
    if (!res.value) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy công việc' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, data: res.value });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể cập nhật công việc';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { tasks } = await getCollections();
    const res = await tasks.deleteOne({ id: params.id });
    if (res.deletedCount === 0) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy công việc' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể xóa công việc';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

