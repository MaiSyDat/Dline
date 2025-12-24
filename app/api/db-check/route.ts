import { NextResponse } from 'next/server';
import { ensureCollections, pingDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await pingDb();
    const collections = await ensureCollections();
    return NextResponse.json({ ok: true, result, collections });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể kết nối cơ sở dữ liệu';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

