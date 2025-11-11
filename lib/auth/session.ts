/**
 * JWT Session Management
 * Handles user authentication sessions with JWT tokens
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { ensureJwtSecret } from '@/lib/utils/env-validation';

/**
 * Session payload interface
 */
export interface SessionPayload {
  userId: string;
  email: string;
  name?: string;
  emailVerified: boolean;
}

/**
 * Session data with metadata
 */
export interface Session extends SessionPayload {
  iat: number; // Issued at
  exp: number; // Expires at
}

/**
 * JWT configuration
 */
const JWT_CONFIG = {
  secret: new TextEncoder().encode(ensureJwtSecret()),
  algorithm: 'HS256' as const,
  accessTokenExpiry: '15m', // 15 minutes
  refreshTokenExpiry: '7d', // 7 days
  cookieName: 'session',
  refreshCookieName: 'refresh_token',
};

/**
 * Convert expiry string to seconds
 */
function expiryToSeconds(expiry: string): number {
  const unit = expiry.slice(-1);
  const value = parseInt(expiry.slice(0, -1), 10);

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    case 'd':
      return value * 86400;
    default:
      return 900; // Default 15 minutes
  }
}

/**
 * Create access token (short-lived)
 */
export async function createAccessToken(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: JWT_CONFIG.algorithm })
    .setIssuedAt()
    .setExpirationTime(JWT_CONFIG.accessTokenExpiry)
    .sign(JWT_CONFIG.secret);

  return token;
}

/**
 * Create refresh token (long-lived)
 */
export async function createRefreshToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId, type: 'refresh' } as any)
    .setProtectedHeader({ alg: JWT_CONFIG.algorithm })
    .setIssuedAt()
    .setExpirationTime(JWT_CONFIG.refreshTokenExpiry)
    .sign(JWT_CONFIG.secret);

  return token;
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken<T = Session>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_CONFIG.secret);
    return payload as T;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Get session from request cookies
 */
export async function getSession(request?: NextRequest): Promise<Session | null> {
  let token: string | undefined;

  if (request) {
    // Get from request (middleware)
    token = request.cookies.get(JWT_CONFIG.cookieName)?.value;
  } else {
    // Get from cookies (server components/actions)
    const cookieStore = await cookies();
    token = cookieStore.get(JWT_CONFIG.cookieName)?.value;
  }

  if (!token) {
    return null;
  }

  return verifyToken<Session>(token);
}

/**
 * Get refresh token from cookies
 */
export async function getRefreshToken(request?: NextRequest): Promise<string | null> {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get(JWT_CONFIG.refreshCookieName)?.value;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(JWT_CONFIG.refreshCookieName)?.value;
  }

  return token || null;
}

/**
 * Set session cookie
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  const maxAge = expiryToSeconds(JWT_CONFIG.accessTokenExpiry);

  response.cookies.set(JWT_CONFIG.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });
}

/**
 * Set refresh token cookie
 */
export function setRefreshCookie(response: NextResponse, token: string): void {
  const maxAge = expiryToSeconds(JWT_CONFIG.refreshTokenExpiry);

  response.cookies.set(JWT_CONFIG.refreshCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });
}

/**
 * Delete session cookies (logout)
 */
export function deleteSessionCookies(response: NextResponse): void {
  response.cookies.delete(JWT_CONFIG.cookieName);
  response.cookies.delete(JWT_CONFIG.refreshCookieName);
}

/**
 * Create session and set cookies
 */
export async function createSession(
  response: NextResponse,
  payload: SessionPayload
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = await createAccessToken(payload);
  const refreshToken = await createRefreshToken(payload.userId);

  setSessionCookie(response, accessToken);
  setRefreshCookie(response, refreshToken);

  return { accessToken, refreshToken };
}

/**
 * Refresh session with new access token
 */
export async function refreshSession(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  const payload = await verifyToken<{ userId: string; type: string }>(refreshToken);

  if (!payload || payload.type !== 'refresh') {
    return null;
  }

  // Here you would typically fetch fresh user data from database
  // For now, we'll just create a new access token with the user ID
  // In production, you should fetch user data from Supabase

  // TODO: Fetch user from database
  // const user = await getUserById(payload.userId);
  // if (!user) return null;

  // For now, return null - this should be implemented when we create the user API
  return null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(request?: NextRequest): Promise<boolean> {
  const session = await getSession(request);
  return session !== null;
}

/**
 * Require authentication (throw if not authenticated)
 */
export async function requireAuth(request?: NextRequest): Promise<Session> {
  const session = await getSession(request);

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}

/**
 * Get user ID from session
 */
export async function getUserId(request?: NextRequest): Promise<string | null> {
  const session = await getSession(request);
  return session?.userId || null;
}

/**
 * Check if email is verified
 */
export async function isEmailVerified(request?: NextRequest): Promise<boolean> {
  const session = await getSession(request);
  return session?.emailVerified || false;
}

/**
 * Update session with new data
 */
export async function updateSession(
  response: NextResponse,
  updates: Partial<SessionPayload>
): Promise<void> {
  const session = await getSession();

  if (!session) {
    throw new Error('No session to update');
  }

  const newPayload: SessionPayload = {
    userId: session.userId,
    email: session.email,
    name: session.name,
    emailVerified: session.emailVerified,
    ...updates,
  };

  const newToken = await createAccessToken(newPayload);
  setSessionCookie(response, newToken);
}
