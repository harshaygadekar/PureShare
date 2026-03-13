/**
 * Rate Limiting Middleware
 * Uses Upstash Redis for distributed rate limiting
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

const redis = isRedisConfigured()
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

function createLimiter(
  prefix: string,
  count: number,
  window: `${number} ${'s' | 'm' | 'h' | 'd'}`,
): Ratelimit | null {
  if (!redis) {
    return null;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(count, window),
    analytics: true,
    prefix,
  });
}

/**
 * Rate limiters for different endpoints
 */
export const rateLimiters = {
  // Anonymous uploads: 5 per hour per IP
  anonymousUpload: createLimiter('ratelimit:anonymous-upload', 5, '1 h'),

  // Authenticated uploads: 50 per hour per user
  authenticatedUpload: createLimiter('ratelimit:auth-upload', 50, '1 h'),

  // Password attempts: 5 per 15 minutes per share
  passwordAttempt: createLimiter('ratelimit:password', 5, '15 m'),

  // Login attempts: 5 per hour per IP
  login: createLimiter('ratelimit:login', 5, '1 h'),

  // Signup attempts: 3 per day per IP
  signup: createLimiter('ratelimit:signup', 3, '24 h'),

  // API general: 100 per minute per IP
  api: createLimiter('ratelimit:api', 100, '1 m'),

  // File downloads: 50 per hour per IP
  download: createLimiter('ratelimit:download', 50, '1 h'),
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
  limiter: Ratelimit | null,
  identifier: string,
): Promise<NextResponse | null> {
  if (!limiter) {
    return null;
  }

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
  limiter: Ratelimit | null,
  getUserId?: (request: NextRequest) => Promise<string | undefined>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Get user ID if auth function provided
    const userId = getUserId ? await getUserId(request) : undefined;

    // Get identifier for rate limiting
    const identifier = getRateLimitIdentifier(request, userId);

    // Apply rate limit
    const rateLimitResponse = await applyRateLimit(limiter, identifier);

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
