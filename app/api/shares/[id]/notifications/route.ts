/**
 * API Route: PATCH /api/shares/[id]/notifications
 * Update notification settings for a share
 */

import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { resolveDatabaseUserId } from '@/lib/db/user-resolution';
import { isValidShareLink } from '@/lib/security/share-link';
import {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  unauthorizedResponse,
} from '@/lib/utils/api-response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return unauthorizedResponse('Authentication required');
    }

    const dbUserId = await resolveDatabaseUserId(clerkUserId);
    if (!dbUserId) {
      return unauthorizedResponse('User not found');
    }

    const { id: shareLink } = await params;

    if (!isValidShareLink(shareLink)) {
      return badRequestResponse('Invalid share link format');
    }

    // Get share and verify ownership
    const { data: share, error: shareError } = await supabaseAdmin
      .from('shares')
      .select('id, user_id')
      .eq('share_link', shareLink)
      .single();

    if (shareError || !share) {
      return notFoundResponse('Share not found');
    }

    // Verify ownership
    if (share.user_id !== dbUserId) {
      return unauthorizedResponse('Not authorized to modify this share');
    }

    const body = await request.json();
    const { notify_on_download, notify_on_view } = body;

    // Upsert notification settings
    const { data: notificationSettings, error: notifError } = await supabaseAdmin
      .from('share_notifications')
      .upsert(
        {
          share_id: share.id,
          user_id: dbUserId,
          notify_on_download: notify_on_download ?? true,
          notify_on_view: notify_on_view ?? false,
        },
        { onConflict: 'share_id' }
      )
      .select()
      .single();

    if (notifError) {
      console.error('Error updating notification settings:', notifError);
      return badRequestResponse('Failed to update notification settings');
    }

    return successResponse({
      message: 'Notification settings updated',
      settings: notificationSettings,
    });
  } catch (error) {
    console.error('Unexpected error in update notifications:', error);
    return badRequestResponse('An unexpected error occurred');
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return unauthorizedResponse('Authentication required');
    }

    const dbUserId = await resolveDatabaseUserId(clerkUserId);
    if (!dbUserId) {
      return unauthorizedResponse('User not found');
    }

    const { id: shareLink } = await params;

    if (!isValidShareLink(shareLink)) {
      return badRequestResponse('Invalid share link format');
    }

    // Get share
    const { data: share, error: shareError } = await supabaseAdmin
      .from('shares')
      .select('id, user_id')
      .eq('share_link', shareLink)
      .single();

    if (shareError || !share) {
      return notFoundResponse('Share not found');
    }

    // Verify ownership
    if (share.user_id !== dbUserId) {
      return unauthorizedResponse('Not authorized to view this share');
    }

    // Get notification settings
    const { data: notificationSettings } = await supabaseAdmin
      .from('share_notifications')
      .select('*')
      .eq('share_id', share.id)
      .single();

    return successResponse({
      settings: notificationSettings || {
        notify_on_download: false,
        notify_on_view: false,
      },
    });
  } catch (error) {
    console.error('Unexpected error in get notifications:', error);
    return badRequestResponse('An unexpected error occurred');
  }
}
