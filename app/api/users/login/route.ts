import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Thiếu email/password' }, { status: 400 });
    }

    const { users } = await getCollections();
    const user = await users.findOne({ email, password });
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Sai thông tin đăng nhập' }, { status: 401 });
    }

    return NextResponse.json({ ok: true, data: user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể đăng nhập';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

