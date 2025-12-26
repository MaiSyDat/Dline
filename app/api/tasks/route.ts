import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/db';
import { Task, TaskPriority, TaskStatus, UserRole } from '@/types';
import { auth } from '@/auth';
import { checkRateLimit, getClientIdentifier } from '@/lib/rateLimit';
import { sanitizeString, isValidStringArray } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cache headers cho GET requests
const CACHE_HEADERS = {
  'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
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
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.resetTime),
          }
        }
      );
    }

    const session = await auth();
    const { tasks } = await getCollections();
    
    // Nếu là Employee, chỉ trả về tasks được assign cho họ
    if (session?.user?.role === UserRole.EMPLOYEE) {
      const data = await tasks.find({ assigneeId: session.user.id }).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(
        { ok: true, data },
        { headers: { ...CACHE_HEADERS, 'X-RateLimit-Remaining': String(rateLimit.remaining) } }
      );
    }
    
    // Admin và Manager xem tất cả tasks
    const data = await tasks.find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json(
      { ok: true, data },
      { headers: { ...CACHE_HEADERS, 'X-RateLimit-Remaining': String(rateLimit.remaining) } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể lấy danh sách tasks';
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

    const body = await req.json();
    
    // Validate và sanitize input
    const projectId = sanitizeString(body.projectId, 100);
    const title = sanitizeString(body.title, 500);
    const description = sanitizeString(body.description || '', 10000);
    const assigneeId = body.assigneeId ? sanitizeString(body.assigneeId, 100) : undefined;
    const startDate = body.startDate ? sanitizeString(body.startDate, 50) : undefined;
    const deadline = body.deadline ? sanitizeString(body.deadline, 50) : undefined;
    const status = body.status || TaskStatus.NEW;
    const priority = body.priority || TaskPriority.MEDIUM;
    const imageUrls = isValidStringArray(body.imageUrls, 20) ? body.imageUrls : undefined;

    if (!projectId || !title) {
      return NextResponse.json({ ok: false, error: 'Thiếu projectId hoặc title' }, { status: 400 });
    }

    // Validate title length
    if (title.length < 1 || title.length > 500) {
      return NextResponse.json({ ok: false, error: 'Tiêu đề phải từ 1 đến 500 ký tự' }, { status: 400 });
    }

    // Validate description length
    if (description.length > 10000) {
      return NextResponse.json({ ok: false, error: 'Mô tả không được vượt quá 10000 ký tự' }, { status: 400 });
    }

    // Kiểm tra project membership
    const { projects, tasks } = await getCollections();
    const project = await projects.findOne({ id: projectId });
    if (!project) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy dự án' }, { status: 404 });
    }

    // Xác định assigneeId
    let finalAssigneeId = assigneeId;
    
    // Nếu là Employee, tự động assign cho chính họ
    if (session.user.role === UserRole.EMPLOYEE) {
      finalAssigneeId = session.user.id;
    } else if (!finalAssigneeId) {
      return NextResponse.json({ ok: false, error: 'Thiếu assigneeId' }, { status: 400 });
    }

    // Kiểm tra assignee có phải là member của project không
    if (!project.memberIds.includes(finalAssigneeId)) {
      return NextResponse.json({ ok: false, error: 'Người được giao việc phải là thành viên của dự án' }, { status: 400 });
    }

    // deadline là optional
    const id = crypto.randomUUID();
    const task: Task = {
      id,
      projectId,
      title,
      description,
      assigneeId: finalAssigneeId,
      startDate: startDate || new Date().toISOString().split('T')[0],
      deadline, // Optional
      status,
      priority,
      createdAt: new Date().toISOString(),
      imageUrls,
      notes: [] // Initialize notes array
    };

    await tasks.insertOne(task);
    return NextResponse.json({ ok: true, data: task });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể tạo công việc';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

