/**
 * API Route: POST /api/request/[id]/upload
 * Register and finalize a file upload for a file request
 */

import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import {
  applyRateLimit,
  getRateLimitIdentifier,
  rateLimiters,
} from '@/lib/middleware/rate-limit';
import { getUploadPresignedUrl, getS3KeyForRequestFile } from '@/lib/storage/s3';
import { isValidShareLink } from '@/lib/security/share-link';
import {
  requestUploadRegistrationSchema,
  requestUploadStatusSchema,
} from '@/lib/validations/request';
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
    const rateLimitResponse = await applyRateLimit(
      rateLimiters.anonymousUpload,
      getRateLimitIdentifier(request),
    );

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

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
      .eq('request_id', fileRequest.id)
      .neq('upload_status', 'failed');

    if (currentFiles && currentFiles >= fileRequest.max_files) {
      return badRequestResponse('Maximum number of files reached for this request');
    }

    const body = await request.json();
    const validation = requestUploadRegistrationSchema.safeParse(body);

    if (!validation.success) {
      return badRequestResponse(validation.error.issues[0].message);
    }

    const { filename, size, mimeType, email } = validation.data;

    // Validate email if required
    if (fileRequest.require_email && !email) {
      return badRequestResponse('Email is required for this file request');
    }

    // Validate file size
    if (size > fileRequest.max_file_size) {
      return badRequestResponse(
        `File too large. Maximum size is ${fileRequest.max_file_size / 1024 / 1024}MB`
      );
    }

    // Generate S3 key
    const s3Key = getS3KeyForRequestFile(fileRequest.id, filename);

    // Get presigned upload URL
    const uploadUrl = await getUploadPresignedUrl(s3Key, mimeType, 3600); // 1 hour

    const { data: savedFile, error: saveError } = await supabaseAdmin
      .from('request_files')
      .insert({
        request_id: fileRequest.id,
        filename,
        size,
        mime_type: mimeType,
        s3_key: s3Key,
        uploaded_by_email: email,
        upload_status: 'pending',
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
      filename,
    });
  } catch (error) {
    console.error('Unexpected error in upload to request:', error);
    return serverErrorResponse('An unexpected error occurred');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResponse = await applyRateLimit(
      rateLimiters.anonymousUpload,
      getRateLimitIdentifier(request),
    );

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id: shareLink } = await params;

    if (!isValidShareLink(shareLink)) {
      return badRequestResponse('Invalid request link format');
    }

    const { data: fileRequest, error: requestError } = await supabaseAdmin
      .from('file_requests')
      .select('id, expires_at, status')
      .eq('share_link', shareLink)
      .single();

    if (requestError || !fileRequest) {
      return notFoundResponse('File request not found');
    }

    if (new Date(fileRequest.expires_at) < new Date()) {
      return goneResponse('This file request has expired');
    }

    if (fileRequest.status !== 'active') {
      return goneResponse('This file request is no longer accepting uploads');
    }

    const body = await request.json();
    const validation = requestUploadStatusSchema.safeParse(body);

    if (!validation.success) {
      return badRequestResponse(validation.error.issues[0].message);
    }

    const { fileId, status } = validation.data;

    const { data: file, error: fileError } = await supabaseAdmin
      .from('request_files')
      .select('id, upload_status')
      .eq('id', fileId)
      .eq('request_id', fileRequest.id)
      .single();

    if (fileError || !file) {
      return notFoundResponse('File not found');
    }

    if (status === 'failed') {
      if (file.upload_status === 'completed') {
        return badRequestResponse('Completed uploads cannot be marked as failed');
      }

      await supabaseAdmin
        .from('request_files')
        .update({ upload_status: 'failed' })
        .eq('id', file.id)
        .eq('upload_status', 'pending');

      return successResponse({ fileId: file.id, status: 'failed' });
    }

    if (file.upload_status === 'failed') {
      return badRequestResponse('Failed uploads cannot be finalized');
    }

    await supabaseAdmin
      .from('request_files')
      .update({ upload_status: 'completed' })
      .eq('id', file.id)
      .eq('upload_status', 'pending');

    return successResponse({ fileId: file.id, status: 'completed' });
  } catch (error) {
    console.error('Unexpected error finalizing request upload:', error);
    return serverErrorResponse('An unexpected error occurred');
  }
}
