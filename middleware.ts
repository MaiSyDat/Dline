/**
 * Next.js Middleware
 * 
 * Protect routes - redirect to login nếu chưa authenticated
 * Chạy trên Edge Runtime - không import MongoDB
 */

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');
  const isAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');
  const isOnLoginPage = req.nextUrl.pathname === '/';

  // Cho phép API routes và auth routes
  if (isApiRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  // Cho phép auth routes
  if (isAuthRoute) {
    return NextResponse.next();
  }

  // Nếu chưa authenticated và không phải API route, redirect về login
  if (!isAuthenticated && !isApiRoute) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Nếu đã authenticated và đang ở login page, có thể redirect về dashboard
  // (Tùy chọn - có thể bỏ qua để AppShell tự xử lý)
  if (isAuthenticated && isOnLoginPage) {
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

