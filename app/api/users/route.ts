import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/db';
import { User, UserRole } from '@/types';
import { auth } from '@/auth';
import { isAdminOrManager } from '@/lib/permissions';
import { checkRateLimit, getClientIdentifier } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cache headers cho GET requests
const CACHE_HEADERS = {
  'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
};

export async function GET(req: Request) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(req);
    const rateLimit = checkRateLimit(clientId, { windowMs: 60000, maxRequests: 100 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { ok: false, error: 'Quá nhiều requests. Vui lòng thử lại sau.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          }
        }
      );
    }

    const { users } = await getCollections();
    const data = await users.find().sort({ createdAt: -1 }).toArray();
    // Loại bỏ password khỏi response
    const dataWithoutPassword = data.map(({ password, ...user }) => user);
    return NextResponse.json(
      { ok: true, data: dataWithoutPassword },
      { headers: { ...CACHE_HEADERS, 'X-RateLimit-Remaining': String(rateLimit.remaining) } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể lấy danh sách users';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(req);
    const rateLimit = checkRateLimit(clientId, { windowMs: 60000, maxRequests: 10 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { ok: false, error: 'Quá nhiều requests. Vui lòng thử lại sau.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          }
        }
      );
    }

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    // Chỉ Admin và Manager có thể tạo user
    if (!isAdminOrManager(session.user.role)) {
      return NextResponse.json({ ok: false, error: 'Không có quyền tạo người dùng' }, { status: 403 });
    }

    const body = await req.json();
    
    // Validate và sanitize input
    const { sanitizeString, normalizeEmail, isValidPassword } = await import('@/lib/validation');
    const name = sanitizeString(body.name, 100);
    const email = normalizeEmail(body.email);
    const password = body.password;
    const role = body.role || UserRole.EMPLOYEE;
    const avatar = body.avatar ? sanitizeString(body.avatar, 500) : undefined;

    if (!name || !email || !password) {
      return NextResponse.json({ ok: false, error: 'Thiếu name/email/password' }, { status: 400 });
    }

    // Validate name length
    if (name.length < 1 || name.length > 100) {
      return NextResponse.json({ ok: false, error: 'Tên phải từ 1 đến 100 ký tự' }, { status: 400 });
    }

    // Validate email
    if (!email) {
      return NextResponse.json({ ok: false, error: 'Email không hợp lệ' }, { status: 400 });
    }

    // Validate password
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ ok: false, error: passwordValidation.message }, { status: 400 });
    }

    const normalizedEmail = email;
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

