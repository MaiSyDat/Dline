/**
 * Security Middleware Utilities
 * 
 * Các hàm tiện ích cho security headers và validation
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}

/**
 * Validate Content-Type header
 */
export function validateContentType(req: NextRequest, allowedTypes: string[] = ['application/json']): boolean {
  const contentType = req.headers.get('content-type');
  if (!contentType) {
    return false;
  }
  
  return allowedTypes.some(type => contentType.includes(type));
}

/**
 * Check request size limit
 */
export function checkRequestSize(req: NextRequest, maxSize: number = 1024 * 1024): boolean {
  const contentLength = req.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    return size <= maxSize;
  }
  return true; // Unknown size, allow but should be checked in handler
}

