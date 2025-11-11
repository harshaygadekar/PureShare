/**
 * Security Headers Middleware
 * CORS, CSP, and other security headers
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Allowed origins for CORS
 */
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

/**
 * Production allowed origins (from environment)
 */
const PRODUCTION_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];

const ALL_ALLOWED_ORIGINS = [...ALLOWED_ORIGINS, ...PRODUCTION_ORIGINS];

/**
 * Apply CORS headers to response
 */
export function applyCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin');

  // Check if origin is allowed
  if (origin && ALL_ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, X-CSRF-Token'
    );
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  }

  return response;
}

/**
 * Content Security Policy
 */
function getContentSecurityPolicy(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseDomain = supabaseUrl ? new URL(supabaseUrl).hostname : '';

  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval in dev
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    `connect-src 'self' https://*.supabase.co https://${supabaseDomain} https://*.amazonaws.com wss://*.supabase.co`,
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');
}

/**
 * Apply comprehensive security headers
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // XSS Protection (legacy but still good practice)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy
  response.headers.set('Content-Security-Policy', getContentSecurityPolicy());

  // Permissions Policy (formerly Feature Policy)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Remove server header (security through obscurity)
  response.headers.delete('Server');
  response.headers.delete('X-Powered-By');

  return response;
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightRequest(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin');

    if (origin && ALL_ALLOWED_ORIGINS.includes(origin)) {
      const response = new NextResponse(null, { status: 204 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
      );
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, X-CSRF-Token'
      );
      response.headers.set('Access-Control-Max-Age', '86400');
      return response;
    }
  }

  return null;
}

/**
 * Validate origin for security
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');

  // If no origin header, it's a same-origin request (allow)
  if (!origin) {
    return true;
  }

  // Check if origin is in allowed list
  return ALL_ALLOWED_ORIGINS.includes(origin);
}

/**
 * Get client IP address
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}

/**
 * Get user agent
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Check if request is from a bot
 */
export function isBot(request: NextRequest): boolean {
  const userAgent = getUserAgent(request).toLowerCase();
  const botPatterns = [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'curl',
    'wget',
    'python-requests',
  ];

  return botPatterns.some((pattern) => userAgent.includes(pattern));
}
