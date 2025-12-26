import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/db';
import { Project, UserRole } from '@/types';
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

    const { projects } = await getCollections();
    const data = await projects.find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json(
      { ok: true, data },
      { headers: { ...CACHE_HEADERS, 'X-RateLimit-Remaining': String(rateLimit.remaining) } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể lấy danh sách projects';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(req);
    const rateLimit = checkRateLimit(clientId, { windowMs: 60000, maxRequests: 20 });
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

    // Chỉ Admin và Manager có thể tạo project
    if (!isAdminOrManager(session.user.role)) {
      return NextResponse.json({ ok: false, error: 'Chỉ quản trị viên và quản lý mới có thể tạo dự án' }, { status: 403 });
    }

    const body = await req.json();
    
    // Validate và sanitize input
    const { sanitizeString, isValidStringArray, isValidDate } = await import('@/lib/validation');
    const name = sanitizeString(body.name, 200);
    const description = sanitizeString(body.description || '', 5000);
    const memberIds = isValidStringArray(body.memberIds, 100) ? body.memberIds : [];
    const status = body.status || 'active';
    const startDate = sanitizeString(body.startDate, 50);
    const deadline = body.deadline ? sanitizeString(body.deadline, 50) : undefined;
    const color = sanitizeString(body.color || '#8907E6', 20);
    const managerId = body.managerId ? sanitizeString(body.managerId, 100) : undefined;

    if (!name || !startDate) {
      return NextResponse.json({ ok: false, error: 'Thiếu name hoặc startDate' }, { status: 400 });
    }

    // Validate name length
    if (name.length < 1 || name.length > 200) {
      return NextResponse.json({ ok: false, error: 'Tên dự án phải từ 1 đến 200 ký tự' }, { status: 400 });
    }

    // Validate description length
    if (description.length > 5000) {
      return NextResponse.json({ ok: false, error: 'Mô tả không được vượt quá 5000 ký tự' }, { status: 400 });
    }

    // Validate dates
    if (!isValidDate(startDate)) {
      return NextResponse.json({ ok: false, error: 'Ngày bắt đầu không hợp lệ' }, { status: 400 });
    }

    if (deadline && !isValidDate(deadline)) {
      return NextResponse.json({ ok: false, error: 'Ngày kết thúc không hợp lệ' }, { status: 400 });
    }

    // Validate status
    if (!['active', 'completed', 'on-hold'].includes(status)) {
      return NextResponse.json({ ok: false, error: 'Trạng thái không hợp lệ' }, { status: 400 });
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

