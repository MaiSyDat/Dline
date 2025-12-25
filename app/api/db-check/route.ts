/**
 * Database Check API Route
 * 
 * Kiểm tra kết nối database và list collections
 * Không tự động tạo collections - phải setup riêng
 */

import { NextResponse } from 'next/server';
import { pingDb, getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await pingDb();
    const db = await getDb();
    const collections = (await db.listCollections().toArray()).map(c => c.name);
    return NextResponse.json({ ok: true, result, collections });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể kết nối cơ sở dữ liệu';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

