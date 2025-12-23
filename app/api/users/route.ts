import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/db';
import { User, UserRole } from '@/types';

export async function GET() {
  const { users } = await getCollections();
  const data = await users.find().toArray();
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role = UserRole.EMPLOYEE, avatar } = body as Partial<User> & { password?: string };

    if (!name || !email || !password) {
      return NextResponse.json({ ok: false, error: 'Thiếu name/email/password' }, { status: 400 });
    }

    const { users } = await getCollections();
    const existed = await users.findOne({ email });
    if (existed) {
      return NextResponse.json({ ok: false, error: 'Email đã tồn tại' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const user: User = {
      id,
      name,
      email,
      password,
      role: role as UserRole,
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F172A&color=fff`
    };

    await users.insertOne(user);
    return NextResponse.json({ ok: true, data: user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể tạo user';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

