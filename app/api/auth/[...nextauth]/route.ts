/**
 * NextAuth API Route Handler
 * 
 * Xử lý tất cả NextAuth requests (signin, signout, callback, etc.)
 * Chạy trên Node.js runtime (không phải Edge)
 */

import { handlers } from '@/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const { GET, POST } = handlers;

