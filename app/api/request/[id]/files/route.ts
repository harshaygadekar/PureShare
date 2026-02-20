/**
 * API Route: GET /api/request/[id]/files
 * Get files uploaded to a file request (owner only)
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
      return badRequestResponse('Invalid request link format');
    }

    // Get file request
    const { data: fileRequest, error: requestError } = await supabaseAdmin
      .from('file_requests')
      .select('id, user_id')
      .eq('share_link', shareLink)
      .single();

    if (requestError || !fileRequest) {
      return notFoundResponse('File request not found');
    }

    // Verify ownership
    if (fileRequest.user_id !== dbUserId) {
      return unauthorizedResponse('Not authorized to view these files');
    }

    // Get uploaded files
    const { data: files, error: filesError } = await supabaseAdmin
      .from('request_files')
      .select('*')
      .eq('request_id', fileRequest.id)
      .order('uploaded_at', { ascending: false });

    if (filesError) {
      console.error('Error fetching request files:', filesError);
      return badRequestResponse('Failed to fetch files');
    }

    return successResponse({ files: files || [] });
  } catch (error) {
    console.error('Unexpected error in get request files:', error);
    return badRequestResponse('An unexpected error occurred');
  }
}
