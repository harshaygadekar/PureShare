/**
 * API Route: GET /api/request/[id]
 * Get file request details (public endpoint)
 */

import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { isValidShareLink } from '@/lib/security/share-link';
import {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  goneResponse,
} from '@/lib/utils/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shareLink } = await params;

    if (!isValidShareLink(shareLink)) {
      return badRequestResponse('Invalid request link format');
    }

    // Get file request
    const { data: fileRequest, error } = await supabaseAdmin
      .from('file_requests')
      .select('*')
      .eq('share_link', shareLink)
      .single();

    if (error || !fileRequest) {
      return notFoundResponse('File request not found');
    }

    // Check if expired
    if (new Date(fileRequest.expires_at) < new Date()) {
      return goneResponse('This file request has expired');
    }

    // Check if paused
    if (fileRequest.status !== 'active') {
      return goneResponse('This file request is no longer accepting uploads');
    }

    // Get uploaded files count
    const { count: uploadedFilesCount } = await supabaseAdmin
      .from('request_files')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', fileRequest.id)
      .eq('upload_status', 'completed');

    return successResponse({
      id: fileRequest.id,
      title: fileRequest.title,
      description: fileRequest.description,
      expiresAt: fileRequest.expires_at,
      maxFileSize: fileRequest.max_file_size,
      maxFiles: fileRequest.max_files,
      requireEmail: fileRequest.require_email,
      uploadedFilesCount: uploadedFilesCount || 0,
      allowMultipleUploaders: fileRequest.allow_multiple_uploaders,
    });
  } catch (error) {
    console.error('Unexpected error in get request:', error);
    return badRequestResponse('An unexpected error occurred');
  }
}
