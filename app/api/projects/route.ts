import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/db';
import { Project } from '@/types';

export async function GET() {
  const { projects } = await getCollections();
  const data = await projects.find().toArray();
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      description = '',
      memberIds = [],
      status = 'active',
      startDate,
      deadline,
      color = '#0F172A',
      managerId
    } = body as Partial<Project>;

    if (!name || !startDate) {
      return NextResponse.json({ ok: false, error: 'Thiếu name hoặc startDate' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const proj: Project = {
      id,
      name,
      description,
      memberIds,
      status,
      startDate,
      deadline,
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

