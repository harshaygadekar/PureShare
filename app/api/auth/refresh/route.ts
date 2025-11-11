/**
 * Refresh Token API Route
 * POST /api/auth/refresh
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { getRefreshToken, createSession, verifyToken } from '@/lib/auth/session';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = await getRefreshToken(request);

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No refresh token found' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = await verifyToken<{ userId: string; type: string }>(refreshToken);

    if (!payload || payload.type !== 'refresh') {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Fetch fresh user data from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, email_verified')
      .eq('id', payload.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User not found' },
        { status: 401 }
      );
    }

    // Create new session with fresh data
    const response = NextResponse.json(
      successResponse({
        message: 'Token refreshed successfully',
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
    console.error('Token refresh error:', error);
    return errorResponse('Failed to refresh token');
  }
}
