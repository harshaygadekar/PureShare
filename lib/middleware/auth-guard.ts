/**
 * Authentication Guard Middleware
 * Protects routes and API endpoints requiring authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, Session } from '@/lib/auth/session';

/**
 * Auth guard options
 */
export interface AuthGuardOptions {
  requireEmailVerified?: boolean;
  redirectTo?: string;
  returnJson?: boolean;
}

/**
 * Check if route requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedPrefixes = [
    '/dashboard',
    '/api/user',
    '/api/shares', // User's own shares (when we implement)
  ];

  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Check if route is auth-related (login, signup)
 */
export function isAuthRoute(pathname: string): boolean {
  const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  return authRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Check if route is public API
 */
export function isPublicApiRoute(pathname: string): boolean {
  const publicPrefixes = [
    '/api/upload', // Anonymous uploads allowed
    '/api/share/', // Viewing shares allowed
    '/api/auth/', // Auth endpoints are public
    '/api/health', // Health check
  ];

  return publicPrefixes.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(
  request: NextRequest,
  options: AuthGuardOptions = {}
): Promise<{ session: Session } | NextResponse> {
  const { requireEmailVerified = false, redirectTo = '/login', returnJson = true } = options;

  const session = await getSession(request);

  // Not authenticated
  if (!session) {
    if (returnJson) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to access this resource',
        },
        { status: 401 }
      );
    }

    const url = new URL(redirectTo, request.url);
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Email verification required
  if (requireEmailVerified && !session.emailVerified) {
    if (returnJson) {
      return NextResponse.json(
        {
          error: 'Email not verified',
          message: 'Please verify your email address to access this resource',
        },
        { status: 403 }
      );
    }

    const url = new URL('/verify-email', request.url);
    return NextResponse.redirect(url);
  }

  return { session };
}

/**
 * Higher-order function to wrap API route handlers with auth
 */
export function withAuth(
  handler: (request: NextRequest, session: Session) => Promise<NextResponse>,
  options: AuthGuardOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const result = await requireAuth(request, { ...options, returnJson: true });

    if (result instanceof NextResponse) {
      return result;
    }

    return handler(request, result.session);
  };
}

/**
 * Optional auth (get session if available, but don't require it)
 */
export async function optionalAuth(
  request: NextRequest
): Promise<{ session: Session | null }> {
  const session = await getSession(request);
  return { session };
}

/**
 * Check if user has permission for resource
 */
export function checkResourceOwnership(
  session: Session,
  resourceUserId: string
): boolean {
  return session.userId === resourceUserId;
}

/**
 * Require resource ownership
 */
export function requireResourceOwnership(
  session: Session,
  resourceUserId: string
): void {
  if (!checkResourceOwnership(session, resourceUserId)) {
    throw new Error('Forbidden: You do not have access to this resource');
  }
}

/**
 * Admin check (for future admin features)
 */
export function isAdmin(session: Session): boolean {
  // TODO: Implement admin role check from database
  // For now, return false
  return false;
}

/**
 * Require admin access
 */
export function requireAdmin(session: Session): void {
  if (!isAdmin(session)) {
    throw new Error('Forbidden: Admin access required');
  }
}
