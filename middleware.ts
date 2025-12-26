/**
 * Next.js Middleware
 * 
 * Protect routes - redirect to login nếu chưa authenticated
 * Chạy trên Edge Runtime - không import MongoDB
 * 
 * Uses auth proxy pattern for NextAuth v5 compatibility
 */

import { auth } from './auth.proxy';
import { NextResponse } from 'next/server';
import { addSecurityHeaders } from './middleware.security';

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');
  const isAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');
  const isOnLoginPage = req.nextUrl.pathname === '/';

  let response: NextResponse;

  // Cho phép API routes và auth routes
  if (isApiRoute && !isAuthRoute) {
    response = NextResponse.next();
  }
  // Cho phép auth routes
  else if (isAuthRoute) {
    response = NextResponse.next();
  }
  // Cho phép trang login (không redirect nếu đang ở trang login)
  else if (isOnLoginPage) {
    response = NextResponse.next();
  }
  // Nếu chưa authenticated và không phải API route, redirect về login
  else if (!isAuthenticated && !isApiRoute) {
    response = NextResponse.redirect(new URL('/', req.url));
  }
  // Nếu đã authenticated, cho phép truy cập
  else {
    response = NextResponse.next();
  }

  // Thêm security headers cho tất cả responses
  return addSecurityHeaders(response);
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

