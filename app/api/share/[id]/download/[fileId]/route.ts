/**
 * API Route: GET /api/share/[id]/download/[fileId]
 * Generates a presigned download URL for a specific file
 */

import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { getDownloadPresignedUrl } from '@/lib/storage/s3';
import { isValidShareLink } from '@/lib/auth/share-link';
import {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  goneResponse,
  serverErrorResponse,
} from '@/lib/utils/api-response';
import type { DownloadUrlResponse } from '@/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { id: shareLink, fileId } = await params;

    // Validate share link format
    if (!isValidShareLink(shareLink)) {
      return badRequestResponse('Invalid share link format');
    }

    // Get share from database
    const { data: share, error: shareError } = await supabaseAdmin
      .from('shares')
      .select('id, expires_at')
      .eq('share_link', shareLink)
      .single();

    if (shareError || !share) {
      return notFoundResponse('Share not found');
    }

    // Check if expired
    if (new Date(share.expires_at) < new Date()) {
      return goneResponse('Share has expired');
    }

    // Get file from database
    const { data: file, error: fileError } = await supabaseAdmin
      .from('files')
      .select('id, filename, s3_key, share_id')
      .eq('id', fileId)
      .eq('share_id', share.id)
      .single();

    if (fileError || !file) {
      return notFoundResponse('File not found');
    }

    // Generate presigned download URL (1 hour expiry)
    const downloadUrl = await getDownloadPresignedUrl(file.s3_key, 3600);

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
