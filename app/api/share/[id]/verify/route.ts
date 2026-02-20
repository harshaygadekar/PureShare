/**
 * API Route: POST /api/share/[id]/verify
 * Verifies share access and password if required
 * Sets HTTP-only cookie on successful password verification
 */

import { NextRequest, NextResponse } from 'next/server';
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
import crypto from 'crypto';

function getShareAccessCookieName(shareLink: string): string {
  return `share_access_${shareLink}`;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 64);
}

async function trackShareView(shareId: string, request: NextRequest): Promise<void> {
  try {
    const ipHash = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    await supabaseAdmin.from('share_analytics').insert({
      share_id: shareId,
      event_type: 'view',
      ip_hash: ipHash,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error('Error tracking view:', error);
  }
}

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

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      data: {
        valid: true,
        requiresPassword,
        expiresAt: share.expires_at,
        fileCount: share.file_count,
      } as VerifyShareResponse,
    });

    // Set HTTP-only cookie for verified access (1 hour expiry)
    const cookieName = getShareAccessCookieName(shareLink);
    response.cookies.set(cookieName, 'verified', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
      path: '/',
    });

    // Track view (async, don't block response)
    trackShareView(share.id, request).catch((err) =>
      console.error('View tracking error:', err)
    );

    return response;
  } catch (error) {
    console.error('Unexpected error in verify share:', error);
    return badRequestResponse('An unexpected error occurred');
  }
}
