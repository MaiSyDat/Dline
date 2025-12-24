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

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPassword = password.trim();

    const { users } = await getCollections();
    
    // Tìm user theo email (case-insensitive)
    const user = await users.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    });

    if (!user) {
      console.log('User not found:', normalizedEmail);
      return NextResponse.json({ ok: false, error: 'Sai thông tin đăng nhập' }, { status: 401 });
    }

    // So sánh password
    if (user.password !== normalizedPassword) {
      console.log('Password mismatch for:', normalizedEmail);
      return NextResponse.json({ ok: false, error: 'Sai thông tin đăng nhập' }, { status: 401 });
    }

    // Không trả về password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ ok: true, data: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : 'Không thể đăng nhập';
    const errorDetails = process.env.NODE_ENV === 'development' 
      ? { message, stack: error instanceof Error ? error.stack : undefined }
      : { message: 'Lỗi server. Vui lòng thử lại sau.' };
    return NextResponse.json({ ok: false, error: message, details: errorDetails }, { status: 500 });
  }
}

