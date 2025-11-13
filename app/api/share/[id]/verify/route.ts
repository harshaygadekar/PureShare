/**
 * API Route: POST /api/share/[id]/verify
 * Verifies share access and password if required
 */

import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { verifyPassword } from '@/lib/security/password';
import { isValidShareLink } from '@/lib/security/share-link';
import {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  unauthorizedResponse,
  goneResponse,
} from '@/lib/utils/api-response';
import type { VerifyShareResponse } from '@/types/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shareLink } = await params;

    // Validate share link format
    if (!isValidShareLink(shareLink)) {
      return badRequestResponse('Invalid share link format');
    }

    const body = await request.json();
    const { password } = body;

    // Get share from database
    const { data: share, error } = await supabaseAdmin
      .from('shares')
      .select('id, password_hash, expires_at, file_count')
      .eq('share_link', shareLink)
      .single();

    if (error || !share) {
      return notFoundResponse('Share not found');
    }

    // Check if expired
    const expiresAt = new Date(share.expires_at);
    if (expiresAt < new Date()) {
      return goneResponse('Share has expired');
    }

    // Check if password is required
    const requiresPassword = !!share.password_hash;

    if (requiresPassword) {
      if (!password) {
        return unauthorizedResponse('Password required');
      }

      // Verify password
      const isValid = await verifyPassword(password, share.password_hash);
      if (!isValid) {
        return unauthorizedResponse('Invalid password');
      }
    }

    const response: VerifyShareResponse = {
      valid: true,
      requiresPassword,
      expiresAt: share.expires_at,
      fileCount: share.file_count,
    };

    return successResponse(response);
  } catch (error) {
    console.error('Unexpected error in verify share:', error);
    return badRequestResponse('An unexpected error occurred');
  }
}
