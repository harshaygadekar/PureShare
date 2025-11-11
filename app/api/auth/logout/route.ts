/**
 * User Logout API Route
 * POST /api/auth/logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteSessionCookies } from '@/lib/auth/session';
import { successResponse } from '@/lib/utils/api-response';

/**
 * POST /api/auth/logout
 * Clear session and logout user
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    successResponse({
      message: 'Logged out successfully',
    }),
    { status: 200 }
  );

  // Delete session cookies
  deleteSessionCookies(response);

  return response;
}
