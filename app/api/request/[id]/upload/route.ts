/**
 * API Route: POST /api/request/[id]/upload
 * Upload a file to a file request
 */

import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { getUploadPresignedUrl, getS3KeyForRequestFile } from '@/lib/storage/s3';
import { isValidShareLink } from '@/lib/security/share-link';
import {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  goneResponse,
  serverErrorResponse,
} from '@/lib/utils/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shareLink } = await params;

    if (!isValidShareLink(shareLink)) {
      return badRequestResponse('Invalid request link format');
    }

    // Get file request
    const { data: fileRequest, error: requestError } = await supabaseAdmin
      .from('file_requests')
      .select('*')
      .eq('share_link', shareLink)
      .single();

    if (requestError || !fileRequest) {
      return notFoundResponse('File request not found');
    }

    // Check if expired
    if (new Date(fileRequest.expires_at) < new Date()) {
      return goneResponse('This file request has expired');
    }

    // Check if active
    if (fileRequest.status !== 'active') {
      return goneResponse('This file request is no longer accepting uploads');
    }

    // Check file count limit
    const { count: currentFiles } = await supabaseAdmin
      .from('request_files')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', fileRequest.id);

    if (currentFiles && currentFiles >= fileRequest.max_files) {
      return badRequestResponse('Maximum number of files reached for this request');
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const email = formData.get('email') as string | null;

    if (!file) {
      return badRequestResponse('No file provided');
    }

    // Validate email if required
    if (fileRequest.require_email && !email) {
      return badRequestResponse('Email is required for this file request');
    }

    // Validate file size
    if (file.size > fileRequest.max_file_size) {
      return badRequestResponse(
        `File too large. Maximum size is ${fileRequest.max_file_size / 1024 / 1024}MB`
      );
    }

    // Generate S3 key
    const s3Key = getS3KeyForRequestFile(fileRequest.id, file.name);

    // Get presigned upload URL
    const uploadUrl = await getUploadPresignedUrl(s3Key, file.type, 3600); // 1 hour

    // Save file metadata to database
    const { data: savedFile, error: saveError } = await supabaseAdmin
      .from('request_files')
      .insert({
        request_id: fileRequest.id,
        filename: file.name,
        size: file.size,
        mime_type: file.type,
        s3_key: s3Key,
        uploaded_by_email: email,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving file metadata:', saveError);
      return serverErrorResponse('Failed to save file');
    }

    return successResponse({
      uploadUrl,
      fileId: savedFile.id,
      filename: file.name,
    });
  } catch (error) {
    console.error('Unexpected error in upload to request:', error);
    return serverErrorResponse('An unexpected error occurred');
  }
}
