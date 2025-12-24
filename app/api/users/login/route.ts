import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Thiếu email/password' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPassword = password.trim();

    const { users } = await getCollections();
    const user = await users.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });

    if (!user || user.password !== normalizedPassword) {
      return NextResponse.json({ ok: false, error: 'Sai thông tin đăng nhập' }, { status: 401 });
    }

    // Không trả về password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ ok: true, data: userWithoutPassword });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể đăng nhập';
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error);
    }
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

