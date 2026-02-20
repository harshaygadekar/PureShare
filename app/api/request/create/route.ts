/**
 * API Route: POST /api/request/create
 * Create a new file request
 */

import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { resolveDatabaseUserId } from '@/lib/db/user-resolution';
import { nanoid } from 'nanoid';
import {
  successResponse,
  badRequestResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return unauthorizedResponse('Authentication required');
    }

    const dbUserId = await resolveDatabaseUserId(clerkUserId, { allowProvision: true });
    if (!dbUserId) {
      return badRequestResponse('Unable to resolve user');
    }

    const body = await request.json();
    const { title, description, expirationHours } = body;

    // Generate unique share link
    const shareLink = nanoid(10);

    // Calculate expiration date (default 7 days)
    const hours = expirationHours || 168;
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

    // Create file request
    const { data: fileRequest, error } = await supabaseAdmin
      .from('file_requests')
      .insert({
        share_link: shareLink,
        user_id: dbUserId,
        title: title || 'File Request',
        description,
        expires_at: expiresAt,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating file request:', error);
      return badRequestResponse('Failed to create file request');
    }

    return successResponse({
      requestId: fileRequest.id,
      shareLink: fileRequest.share_link,
      expiresAt: fileRequest.expires_at,
    });
  } catch (error) {
    console.error('Unexpected error in create request:', error);
    return serverErrorResponse('An unexpected error occurred');
  }
}
