/**
 * Rate Limiting Middleware
 * Uses Upstash Redis for distributed rate limiting
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Redis client (will use UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

/**
 * Rate limiters for different endpoints
 */
export const rateLimiters = {
  // Anonymous uploads: 5 per hour per IP
  anonymousUpload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    analytics: true,
    prefix: 'ratelimit:anonymous-upload',
  }),

  // Authenticated uploads: 50 per hour per user
  authenticatedUpload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 h'),
    analytics: true,
    prefix: 'ratelimit:auth-upload',
  }),

  // Password attempts: 5 per 15 minutes per share
  passwordAttempt: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
    prefix: 'ratelimit:password',
  }),

  // Login attempts: 5 per hour per IP
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    analytics: true,
    prefix: 'ratelimit:login',
  }),

  // Signup attempts: 3 per day per IP
  signup: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '24 h'),
    analytics: true,
    prefix: 'ratelimit:signup',
  }),

  // API general: 100 per minute per IP
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'ratelimit:api',
  }),

  // File downloads: 50 per hour per IP
  download: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 h'),
    analytics: true,
    prefix: 'ratelimit:download',
  }),
};

/**
 * Get identifier for rate limiting (IP address or user ID)
 */
export function getRateLimitIdentifier(request: NextRequest, userId?: string): string {
  // Prefer user ID if authenticated
  if (userId) {
    return `user:${userId}`;
  }

  // Fallback to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Apply rate limit and return appropriate response if exceeded
 */
export async function applyRateLimit(
  limiter: Ratelimit,
  identifier: string,
  request: NextRequest
): Promise<NextResponse | null> {
  try {
    const { success, limit, reset, remaining } = await limiter.limit(identifier);

    // Add rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', limit.toString());
    headers.set('X-RateLimit-Remaining', remaining.toString());
    headers.set('X-RateLimit-Reset', reset.toString());

    if (!success) {
      // Rate limit exceeded
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'You have exceeded the rate limit. Please try again later.',
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Rate limit passed, return null to continue
    return null;
  } catch (error) {
    // If rate limiting fails, log error but allow request (fail open)
    console.error('Rate limiting error:', error);
    return null;
  }
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  limiter: Ratelimit,
  getUserId?: (request: NextRequest) => Promise<string | undefined>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Get user ID if auth function provided
    const userId = getUserId ? await getUserId(request) : undefined;

    // Get identifier for rate limiting
    const identifier = getRateLimitIdentifier(request, userId);

    // Apply rate limit
    const rateLimitResponse = await applyRateLimit(limiter, identifier, request);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Rate limit passed, execute handler
    return handler(request);
  };
}

/**
 * Check if Redis is properly configured
 */
export function isRedisConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Get rate limit status for debugging
 */
export async function getRateLimitStatus(
  limiter: Ratelimit,
  identifier: string
): Promise<{ limit: number; remaining: number; reset: number } | null> {
  try {
    const { limit, remaining, reset } = await limiter.limit(identifier);
    return { limit, remaining, reset };
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    return null;
  }
}
