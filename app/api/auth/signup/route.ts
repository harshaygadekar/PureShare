/**
 * User Signup API Route
 * POST /api/auth/signup
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/db/supabase';
import { hashPassword } from '@/lib/auth/password';
import { passwordSchema } from '@/lib/auth/password-requirements';
import { sanitizeEmail, sanitizeInput } from '@/lib/security/sanitize';
import { createSession } from '@/lib/auth/session';
import { badRequestResponse, errorResponse, successResponse } from '@/lib/utils/api-response';
import { applyRateLimit, getRateLimitIdentifier, rateLimiters } from '@/lib/middleware/rate-limit';
import { nanoid } from 'nanoid';

/**
 * Signup request schema
 */
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long').optional(),
});

/**
 * POST /api/auth/signup
 * Create new user account
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (3 signups per day per IP)
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResponse = await applyRateLimit(rateLimiters.signup, identifier, request);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return badRequestResponse(validation.error.issues[0].message);
    }

    const { email, password, name } = validation.data;

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedName = name ? sanitizeInput(name, 100) : undefined;

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', sanitizedEmail)
      .single();

    if (existingUser) {
      return badRequestResponse('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const { data: user, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        email: sanitizedEmail,
        password_hash: passwordHash,
        name: sanitizedName,
        email_verified: false,
      })
      .select('id, email, name, email_verified, created_at')
      .single();

    if (createError || !user) {
      console.error('User creation error:', createError);
      return errorResponse('Failed to create account. Please try again.');
    }

    // Generate email verification token
    const verificationToken = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    const { error: tokenError } = await supabaseAdmin
      .from('verification_tokens')
      .insert({
        user_id: user.id,
        token: verificationToken,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error('Token creation error:', tokenError);
      // Continue anyway - user can request new verification email
    }

    // Create session
    const response = NextResponse.json(
      successResponse({
        message: 'Account created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.email_verified,
        },
        verificationRequired: true,
      }),
      { status: 201 }
    );

    await createSession(response, {
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
      emailVerified: user.email_verified,
    });

    // TODO: Send verification email
    // await sendVerificationEmail(sanitizedEmail, verificationToken);

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse('An unexpected error occurred. Please try again.');
  }
}
