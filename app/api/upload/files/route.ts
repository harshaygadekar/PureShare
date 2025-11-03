/**
 * API Route: POST /api/upload/files
 * Handles file uploads to S3 and stores metadata in database
 */

import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { generateS3Key, getUploadPresignedUrl } from '@/lib/storage/s3';
import { uploadFileSchema } from '@/lib/validations/share';
import {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  goneResponse,
  serverErrorResponse,
} from '@/lib/utils/api-response';
import type { UploadFileResponse } from '@/types/api';
import { FILE_CONFIG } from '@/config/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = uploadFileSchema.safeParse(body);
    if (!validation.success) {
      return badRequestResponse(validation.error.errors[0].message);
    }

    const { shareLink, filename, size, mimeType } = validation.data;

    // Check if share exists and is not expired
    const { data: share, error: shareError } = await supabaseAdmin
      .from('shares')
      .select('id, expires_at, file_count')
      .eq('share_link', shareLink)
      .single();

    if (shareError || !share) {
      return notFoundResponse('Share not found');
    }

    // Check if expired
    if (new Date(share.expires_at) < new Date()) {
      return goneResponse('Share has expired');
    }

    // Check file count limit
    if (share.file_count >= FILE_CONFIG.maxFilesPerShare) {
      return badRequestResponse(`Maximum ${FILE_CONFIG.maxFilesPerShare} files per share`);
    }

    // Generate S3 key
    const s3Key = generateS3Key(share.id, filename);

    // Generate presigned URL for upload
    const uploadUrl = await getUploadPresignedUrl(s3Key, mimeType, 3600);

    // Insert file metadata into database
    const { data: file, error: fileError } = await supabaseAdmin
      .from('files')
      .insert({
        share_id: share.id,
        filename,
        size,
        mime_type: mimeType,
        s3_key: s3Key,
      })
      .select('id, filename, size')
      .single();

    if (fileError) {
      console.error('Error creating file record:', fileError);
      return serverErrorResponse('Failed to create file record');
    }

    // Update file count
    await supabaseAdmin
      .from('shares')
      .update({ file_count: share.file_count + 1 })
      .eq('id', share.id);

    const response: UploadFileResponse = {
      fileId: file.id,
      filename: file.filename,
      size: file.size,
      previewUrl: uploadUrl,
    };

    return successResponse(response, 201);
  } catch (error) {
    console.error('Unexpected error in upload files:', error);
    return serverErrorResponse('An unexpected error occurred');
  }
}
