import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/db';
import { Project, UserRole } from '@/types';
import { auth } from '@/auth';
import { isAdminOrManager } from '@/lib/permissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { projects } = await getCollections();
    const data = await projects.find().toArray();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể lấy danh sách projects';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    // Chỉ Admin và Manager có thể tạo project
    if (!isAdminOrManager(session.user.role)) {
      return NextResponse.json({ ok: false, error: 'Chỉ quản trị viên và quản lý mới có thể tạo dự án' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      description = '',
      memberIds = [],
      status = 'active',
      startDate,
      deadline,
      color = '#090041',
      managerId
    } = body as Partial<Project>;

    if (!name || !startDate) {
      return NextResponse.json({ ok: false, error: 'Thiếu name hoặc startDate' }, { status: 400 });
    }

    // deadline là optional
    const id = crypto.randomUUID();
    const proj: Project = {
      id,
      name,
      description,
      memberIds,
      status,
      startDate,
      deadline, // Optional
      color,
      createdAt: new Date().toISOString(),
      managerId: managerId || memberIds[0] || ''
    };

    const { projects } = await getCollections();
    await projects.insertOne(proj);
    return NextResponse.json({ ok: true, data: proj });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể tạo dự án';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

