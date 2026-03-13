/**
 * API Route: GET /api/share/[id]/download/[fileId]
 * Generates a presigned download URL for a specific file
 * Enforces password protection via cookie verification
 * Sends download notification to share owner
 */

import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import {
  applyRateLimit,
  getRateLimitIdentifier,
  rateLimiters,
} from '@/lib/middleware/rate-limit';
import { getDownloadPresignedUrl } from '@/lib/storage/s3';
import { isValidShareLink } from '@/lib/security/share-link';
import { sendDownloadNotification } from '@/lib/email/notification-service';
import {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  goneResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/utils/api-response';
import type { DownloadUrlResponse } from '@/types/api';
import crypto from 'crypto';

function getShareAccessCookieName(shareLink: string): string {
  return `share_access_${shareLink}`;
}

function isShareAccessVerified(request: NextRequest, shareLink: string): boolean {
  const cookieName = getShareAccessCookieName(shareLink);
  const cookie = request.cookies.get(cookieName);
  return cookie?.value === 'verified';
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 64);
}

async function trackFileDownload(
  shareId: string,
  fileId: string,
  request: NextRequest
): Promise<void> {
  try {
    const ipHash = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    await supabaseAdmin.from('share_analytics').insert({
      share_id: shareId,
      event_type: 'download_file',
      file_id: fileId,
      ip_hash: ipHash,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error('Error tracking download:', error);
  }
}

async function sendDownloadNotificationIfEnabled(
  shareId: string,
  shareLink: string,
  filename: string,
  totalDownloads: number,
): Promise<void> {
  try {
    // Check if notifications are enabled for this share
    const { data: notificationSettings } = await supabaseAdmin
      .from('share_notifications')
      .select('user_id, notify_on_download')
      .eq('share_id', shareId)
      .eq('notify_on_download', true)
      .single();

    if (!notificationSettings) {
      return;
    }

    // Get user email
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', notificationSettings.user_id)
      .single();

    if (!user?.email) {
      return;
    }

    // Send notification
    await sendDownloadNotification({
      to: user.email,
      shareLink,
      filename,
      downloadTime: new Date().toLocaleString(),
      totalDownloads,
    });
  } catch (error) {
    console.error('Error sending download notification:', error);
    // Don't fail the download if notification fails
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { id: shareLink, fileId } = await params;

    const rateLimitResponse = await applyRateLimit(
      rateLimiters.download,
      `${getRateLimitIdentifier(request)}:share:${shareLink}`,
    );

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Validate share link format
    if (!isValidShareLink(shareLink)) {
      return badRequestResponse('Invalid share link format');
    }

    // Get share from database
    const { data: share, error: shareError } = await supabaseAdmin
      .from('shares')
      .select('id, expires_at, password_hash, user_id')
      .eq('share_link', shareLink)
      .single();

    if (shareError || !share) {
      return notFoundResponse('Share not found');
    }

    // Check if expired
    if (new Date(share.expires_at) < new Date()) {
      return goneResponse('Share has expired');
    }

    // Check password protection if required
    const requiresPassword = !!share.password_hash;
    if (requiresPassword) {
      if (!isShareAccessVerified(request, shareLink)) {
        return unauthorizedResponse('Password required');
      }
    }

    // Get file from database
    const { data: file, error: fileError } = await supabaseAdmin
      .from('files')
      .select('id, filename, s3_key, share_id, upload_status')
      .eq('id', fileId)
      .eq('share_id', share.id)
      .eq('upload_status', 'completed')
      .single();

    if (fileError || !file) {
      return notFoundResponse('File not found');
    }

    const { data: updatedCount, error: incrementError } = await supabaseAdmin.rpc(
      'increment_file_download_count',
      { target_file_id: file.id },
    );

    if (incrementError) {
      console.error('Error incrementing download count:', incrementError);
      return serverErrorResponse('Failed to update download count');
    }

    const totalDownloads = Array.isArray(updatedCount)
      ? updatedCount[0]
      : updatedCount;

    // Track download event (async, don't block response)
    trackFileDownload(share.id, file.id, request).catch((err) =>
      console.error('Download tracking error:', err)
    );

    // Send download notification if enabled (async, don't wait)
    if (share.user_id) {
      sendDownloadNotificationIfEnabled(
        share.id,
        shareLink,
        file.filename,
        typeof totalDownloads === 'number' ? totalDownloads : 0,
      ).catch((err) => console.error('Notification error:', err));
    }

    // Generate presigned download URL (1 hour expiry)
    const downloadUrl = await getDownloadPresignedUrl(
      file.s3_key,
      3600,
      file.filename,
    );

    const response: DownloadUrlResponse = {
      downloadUrl,
      filename: file.filename,
    };

    return successResponse(response);
  } catch (error) {
    console.error('Unexpected error in download file:', error);
    return serverErrorResponse('An unexpected error occurred');
  }
}
