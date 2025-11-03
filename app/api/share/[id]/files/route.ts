/**
 * API Route: GET /api/share/[id]/files
 * Returns all files for a share with presigned URLs
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
import type { GetFilesResponse, FileMetadata } from '@/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shareLink } = await params;

    // Validate share link format
    if (!isValidShareLink(shareLink)) {
      return badRequestResponse('Invalid share link format');
    }

    // Get share from database
    const { data: share, error: shareError } = await supabaseAdmin
      .from('shares')
      .select('id, expires_at, file_count')
      .eq('share_link', shareLink)
      .single();

    if (shareError || !share) {
      return notFoundResponse('Share not found');
    }

    // Check if expired
    const expiresAt = new Date(share.expires_at);
    if (expiresAt < new Date()) {
      return goneResponse('Share has expired');
    }

    // Get all files for this share
    const { data: files, error: filesError } = await supabaseAdmin
      .from('files')
      .select('id, filename, size, mime_type, s3_key, uploaded_at')
      .eq('share_id', share.id)
      .order('uploaded_at', { ascending: false });

    if (filesError) {
      console.error('Error fetching files:', filesError);
      return serverErrorResponse('Failed to fetch files');
    }

    // Generate presigned URLs for each file
    const filesWithUrls: FileMetadata[] = await Promise.all(
      (files || []).map(async (file) => {
        const previewUrl = await getDownloadPresignedUrl(file.s3_key, 86400); // 24 hours

        return {
          id: file.id,
          filename: file.filename,
          size: file.size,
          mimeType: file.mime_type,
          uploadedAt: file.uploaded_at,
          previewUrl,
        };
      })
    );

    const response: GetFilesResponse = {
      files: filesWithUrls,
      shareInfo: {
        expiresAt: share.expires_at,
        fileCount: share.file_count,
      },
    };

    return successResponse(response);
  } catch (error) {
    console.error('Unexpected error in get files:', error);
    return serverErrorResponse('An unexpected error occurred');
  }
}
