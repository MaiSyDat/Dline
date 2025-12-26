import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/db';
import { UserRole, User } from '@/types';
import { auth } from '@/auth';
import { isAdminOrManager, canManagerDeleteUser, canManagerEditUser } from '@/lib/permissions';
import { FindOneAndUpdateOptions, WithId } from 'mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/users/[id]
 * 
 * Lấy thông tin user theo ID (bao gồm password nếu có quyền)
 * - Chỉ Admin và Manager có thể lấy thông tin user với password
 */
export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const includePassword = searchParams.get('includePassword') === 'true';
    
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Thiếu ID người dùng' }, { status: 400 });
    }

    // Lấy session để kiểm tra quyền
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const currentUserRole = session.user.role;

    // Chỉ Admin và Manager mới có quyền lấy password
    if (includePassword && !isAdminOrManager(currentUserRole)) {
      return NextResponse.json({ ok: false, error: 'Không có quyền xem mật khẩu' }, { status: 403 });
    }

    const { users } = await getCollections();
    const user = await users.findOne({ id });
    
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    // Trả về password nếu có quyền và yêu cầu
    if (includePassword && isAdminOrManager(currentUserRole)) {
      return NextResponse.json({ ok: true, data: user });
    }

    // Không trả về password
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({ ok: true, data: userWithoutPassword });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể lấy thông tin người dùng';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

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

/**
 * PUT /api/users/[id]
 * 
 * Cập nhật thông tin user
 * - Chỉ Admin và Manager có thể chỉnh sửa user
 * - Manager không thể chỉnh sửa Admin
 * - Employee không thể chỉnh sửa bất kỳ user nào
 */
export async function PUT(req: Request, { params }: Params) {
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

    // Chỉ Admin và Manager mới có quyền chỉnh sửa user
    if (!isAdminOrManager(currentUserRole)) {
      return NextResponse.json({ ok: false, error: 'Không có quyền chỉnh sửa người dùng' }, { status: 403 });
    }

    const body = await req.json() as Partial<User>;
    const { users } = await getCollections();
    
    // Lấy thông tin user cần chỉnh sửa
    const userToEdit = await users.findOne({ id });
    if (!userToEdit) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    // Manager không thể chỉnh sửa Admin
    if (!canManagerEditUser(currentUserRole, userToEdit.role)) {
      return NextResponse.json({ ok: false, error: 'Quản lý không thể chỉnh sửa tài khoản quản trị viên' }, { status: 403 });
    }

    // Validate allowed fields (bao gồm password)
    const allowedFields = ['name', 'email', 'role', 'avatar', 'password'];
    const updateData: Partial<User> & { password?: string } = {};
    
    for (const field of allowedFields) {
      if (field in body) {
        if (field === 'email') {
          // Normalize email
          (updateData as any)[field] = (body[field] as string).toLowerCase().trim();
        } else if (field === 'name') {
          // Trim name
          (updateData as any)[field] = (body[field] as string).trim();
        } else if (field === 'password') {
          // Trim password nếu có
          const passwordValue = (body[field] as string)?.trim();
          if (passwordValue) {
            updateData.password = passwordValue;
          }
        } else {
          (updateData as any)[field] = body[field as keyof User];
        }
      }
    }

    // Validate role nếu có
    if (updateData.role && !Object.values(UserRole).includes(updateData.role as UserRole)) {
      return NextResponse.json({ ok: false, error: 'Role không hợp lệ' }, { status: 400 });
    }

    // Kiểm tra email trùng lặp nếu có thay đổi email
    if (updateData.email && updateData.email !== userToEdit.email) {
      const existed = await users.findOne({ 
        id: { $ne: id }, // Không phải chính user này
        email: { $regex: new RegExp(`^${updateData.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
      if (existed) {
        return NextResponse.json({ ok: false, error: 'Email đã tồn tại' }, { status: 400 });
      }
    }

    // Kiểm tra nếu không có field nào để update
    if (Object.keys(updateData).length === 0) {
      // Không có gì để update, trả về user hiện tại
      const { password, ...userWithoutPassword } = userToEdit;
      return NextResponse.json({ ok: true, data: userWithoutPassword });
    }

    // Update user
    const options: FindOneAndUpdateOptions = { returnDocument: 'after' };
    const res = await users.findOneAndUpdate(
      { id },
      { $set: updateData },
      options
    );
    
    const updated = res as unknown as { value?: WithId<User> | null };
    
    if (!updated || !updated.value) {
      // Try to fetch the user again to see if update actually worked
      const checkUser = await users.findOne({ id });
      if (checkUser) {
        // Update actually worked, just returnDocument didn't return it
        const { password, ...userWithoutPassword } = checkUser;
        return NextResponse.json({ ok: true, data: userWithoutPassword });
      }
      
      return NextResponse.json({ ok: false, error: 'Không thể cập nhật người dùng' }, { status: 500 });
    }
    
    // Không trả về password
    const { password, ...userWithoutPassword } = updated.value;
    
    return NextResponse.json({ ok: true, data: userWithoutPassword });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể cập nhật người dùng';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

