/**
 * Global Next.js Middleware
 * Handles authentication, security headers, and CORS
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { isProtectedRoute, isAuthRoute } from '@/lib/middleware/auth-guard';
import {
  handleCorsPreflightRequest,
  applyCorsHeaders,
  applySecurityHeaders,
} from '@/lib/middleware/security-headers';

/**
 * Middleware configuration
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS preflight requests
  const preflightResponse = handleCorsPreflightRequest(request);
  if (preflightResponse) {
    return preflightResponse;
  }

  // Get session
  const session = await getSession(request);

  // Protected routes - require authentication
  if (isProtectedRoute(pathname)) {
    if (!session) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Auth routes - redirect if already logged in
  if (isAuthRoute(pathname)) {
    if (session) {
      const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/dashboard';
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
  }

  // Continue with the request
  const response = NextResponse.next();

  // Apply security headers
  applySecurityHeaders(response);

  // Apply CORS headers
  applyCorsHeaders(request, response);

  return response;
}
