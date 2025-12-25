import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/db';
import { UserRole } from '@/types';
import { auth } from '@/auth';
import { isAdminOrManager, canManagerDeleteUser } from '@/lib/permissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

/**
 * DELETE /api/users/[id]
 * 
 * Xóa user theo ID
 * - Admin và Manager có thể xóa user
 * - Manager không thể xóa Admin
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Thiếu ID người dùng' }, { status: 400 });
    }

    // Lấy session để kiểm tra quyền
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const currentUserRole = session.user.role;

    // Chỉ Admin và Manager mới có quyền xóa user
    if (!isAdminOrManager(currentUserRole)) {
      return NextResponse.json({ ok: false, error: 'Không có quyền xóa người dùng' }, { status: 403 });
    }

    const { users } = await getCollections();
    
    // Lấy thông tin user cần xóa
    const userToDelete = await users.findOne({ id });
    if (!userToDelete) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    // Manager không thể xóa Admin
    if (!canManagerDeleteUser(currentUserRole, userToDelete.role)) {
      return NextResponse.json({ ok: false, error: 'Quản lý không thể xóa tài khoản quản trị viên' }, { status: 403 });
    }

    // Không cho phép xóa chính mình
    if (session.user.id === id) {
      return NextResponse.json({ ok: false, error: 'Không thể xóa tài khoản của chính mình' }, { status: 400 });
    }

    // Xóa user
    const res = await users.deleteOne({ id });
    
    if (res.deletedCount === 0) {
      return NextResponse.json({ ok: false, error: 'Không thể xóa người dùng' }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể xóa người dùng';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

