import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/db';
import { User, UserRole } from '@/types';
import { auth } from '@/auth';
import { isAdminOrManager } from '@/lib/permissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { users } = await getCollections();
    const data = await users.find().toArray();
    // Loại bỏ password khỏi response
    const dataWithoutPassword = data.map(({ password, ...user }) => user);
    return NextResponse.json({ ok: true, data: dataWithoutPassword });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể lấy danh sách users';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    // Chỉ Admin và Manager có thể tạo user
    if (!isAdminOrManager(session.user.role)) {
      return NextResponse.json({ ok: false, error: 'Không có quyền tạo người dùng' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role = UserRole.EMPLOYEE, avatar } = body as Partial<User> & { password?: string };

    if (!name || !email || !password) {
      return NextResponse.json({ ok: false, error: 'Thiếu name/email/password' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const { users } = await getCollections();
    const existed = await users.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    if (existed) {
      return NextResponse.json({ ok: false, error: 'Email đã tồn tại' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const user: User = {
      id,
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role as UserRole,
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=0F172A&color=fff`
    };

    await users.insertOne(user);
    // Không trả về password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ ok: true, data: userWithoutPassword });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể tạo user';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

