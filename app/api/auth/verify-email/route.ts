/**
 * Email Verification API Route
 * POST /api/auth/verify-email
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/db/supabase';
import { updateSession, getSession } from '@/lib/auth/session';
import { badRequestResponse, errorResponse, successResponse } from '@/lib/utils/api-response';

/**
 * Verification request schema
 */
const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

/**
 * POST /api/auth/verify-email
 * Verify user email address with token
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = verifyEmailSchema.safeParse(body);

    if (!validation.success) {
      return badRequestResponse(validation.error.issues[0].message);
    }

    const { token } = validation.data;

    // Find verification token
    const { data: verificationToken, error: tokenError } = await supabaseAdmin
      .from('verification_tokens')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();

    if (tokenError || !verificationToken) {
      return badRequestResponse('Invalid or expired verification token');
    }

    // Check if token has expired
    const expiresAt = new Date(verificationToken.expires_at);
    if (expiresAt < new Date()) {
      // Delete expired token
      await supabaseAdmin.from('verification_tokens').delete().eq('token', token);

      return badRequestResponse('Verification token has expired. Please request a new one.');
    }

    // Update user email_verified status
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ email_verified: true, updated_at: new Date().toISOString() })
      .eq('id', verificationToken.user_id);

    if (updateError) {
      console.error('Email verification error:', updateError);
      return errorResponse('Failed to verify email. Please try again.');
    }

    // Delete verification token (single use)
    await supabaseAdmin.from('verification_tokens').delete().eq('token', token);

    // Update session if user is logged in
    const session = await getSession(request);
    const response = NextResponse.json(
      successResponse({
        message: 'Email verified successfully',
      }),
      { status: 200 }
    );

    if (session && session.userId === verificationToken.user_id) {
      await updateSession(response, {
        emailVerified: true,
      });
    }

    return response;
  } catch (error) {
    console.error('Email verification error:', error);
    return errorResponse('An unexpected error occurred. Please try again.');
  }
}
