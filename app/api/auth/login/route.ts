/**
 * User Login API Route
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/db/supabase';
import { verifyPassword } from '@/lib/auth/password';
import { sanitizeEmail } from '@/lib/security/sanitize';
import { createSession } from '@/lib/auth/session';
import { badRequestResponse, errorResponse, successResponse } from '@/lib/utils/api-response';
import { applyRateLimit, getRateLimitIdentifier, rateLimiters } from '@/lib/middleware/rate-limit';

/**
 * Login request schema
 */
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (5 attempts per hour per IP)
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResponse = await applyRateLimit(rateLimiters.login, identifier, request);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return badRequestResponse(validation.error.issues[0].message);
    }

    const { email, password } = validation.data;

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email);

    // Find user by email
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, password_hash, email_verified')
      .eq('email', sanitizedEmail)
      .single();

    if (userError || !user) {
      // Generic error to prevent email enumeration
      return badRequestResponse('Invalid email or password');
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return badRequestResponse('Invalid email or password');
    }

    // Update last login timestamp (optional)
    await supabaseAdmin
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', user.id);

    // Create session
    const response = NextResponse.json(
      successResponse({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.email_verified,
        },
      }),
      { status: 200 }
    );

    await createSession(response, {
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
      emailVerified: user.email_verified,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('An unexpected error occurred. Please try again.');
  }
}
