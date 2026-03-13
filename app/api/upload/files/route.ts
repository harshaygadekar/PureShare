/**
 * API Route: POST /api/upload/files
 * Registers pending share file uploads and finalizes them after S3 upload
 */

import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import {
  applyRateLimit,
  getRateLimitIdentifier,
  rateLimiters,
} from "@/lib/middleware/rate-limit";
import { generateS3Key, getUploadPresignedUrl } from "@/lib/storage/s3";
import {
  uploadFileSchema,
  finalizeUploadedFileSchema,
} from "@/lib/validations/share";
import {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  goneResponse,
  serverErrorResponse,
} from "@/lib/utils/api-response";
import type { UploadFileResponse } from "@/types/api";
import { FILE_CONFIG } from "@/config/constants";

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await applyRateLimit(
      rateLimiters.anonymousUpload,
      getRateLimitIdentifier(request),
    );

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();

    // Validate input
    const validation = uploadFileSchema.safeParse(body);
    if (!validation.success) {
      return badRequestResponse(validation.error.issues[0].message);
    }

    const { shareLink, filename, size, mimeType } = validation.data;

    // Check if share exists and is not expired
    const { data: share, error: shareError } = await supabaseAdmin
      .from("shares")
      .select("id, expires_at")
      .eq("share_link", shareLink)
      .single();

    if (shareError || !share) {
      return notFoundResponse("Share not found");
    }

    // Check if expired
    if (new Date(share.expires_at) < new Date()) {
      return goneResponse("Share has expired");
    }

    const { count: registeredFiles, error: countError } = await supabaseAdmin
      .from("files")
      .select("id", { count: "exact", head: true })
      .eq("share_id", share.id)
      .neq("upload_status", "failed");

    if (countError) {
      console.error("Error counting registered files:", countError);
      return serverErrorResponse("Failed to validate share capacity");
    }

    if ((registeredFiles || 0) >= FILE_CONFIG.maxFilesPerShare) {
      return badRequestResponse(
        `Maximum ${FILE_CONFIG.maxFilesPerShare} files per share`,
      );
    }

    // Generate S3 key
    const s3Key = generateS3Key(share.id, filename);

    // Generate presigned URL for upload
    const uploadUrl = await getUploadPresignedUrl(s3Key, mimeType, 3600);

    // Insert file metadata into database
    const { data: file, error: fileError } = await supabaseAdmin
      .from("files")
      .insert({
        share_id: share.id,
        filename,
        size,
        mime_type: mimeType,
        s3_key: s3Key,
        upload_status: "pending",
      })
      .select("id, filename, size")
      .single();

    if (fileError) {
      console.error("Error creating file record:", fileError);
      return serverErrorResponse("Failed to create file record");
    }

    const response: UploadFileResponse = {
      fileId: file.id,
      filename: file.filename,
      size: file.size,
      uploadUrl,
    };

    return successResponse(response, 201);
  } catch (error) {
    console.error("Unexpected error in upload files:", error);
    return serverErrorResponse("An unexpected error occurred");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const rateLimitResponse = await applyRateLimit(
      rateLimiters.anonymousUpload,
      getRateLimitIdentifier(request),
    );

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const validation = finalizeUploadedFileSchema.safeParse(body);

    if (!validation.success) {
      return badRequestResponse(validation.error.issues[0].message);
    }

    const { shareLink, fileId, status } = validation.data;

    const { data: share, error: shareError } = await supabaseAdmin
      .from("shares")
      .select("id, expires_at")
      .eq("share_link", shareLink)
      .single();

    if (shareError || !share) {
      return notFoundResponse("Share not found");
    }

    if (new Date(share.expires_at) < new Date()) {
      return goneResponse("Share has expired");
    }

    const { data: file, error: fileError } = await supabaseAdmin
      .from("files")
      .select("id, share_id, upload_status")
      .eq("id", fileId)
      .eq("share_id", share.id)
      .single();

    if (fileError || !file) {
      return notFoundResponse("File not found");
    }

    if (status === "failed") {
      if (file.upload_status === "completed") {
        return badRequestResponse("Completed uploads cannot be marked as failed");
      }

      await supabaseAdmin
        .from("files")
        .update({ upload_status: "failed" })
        .eq("id", file.id)
        .eq("upload_status", "pending");

      return successResponse({ fileId: file.id, status: "failed" });
    }

    if (file.upload_status === "failed") {
      return badRequestResponse("Failed uploads cannot be finalized");
    }

    const { data: finalizedRows, error: finalizeError } = await supabaseAdmin.rpc(
      "finalize_share_file_upload",
      { target_file_id: file.id },
    );

    if (finalizeError) {
      console.error("Error finalizing share file upload:", finalizeError);
      return serverErrorResponse("Failed to finalize file upload");
    }

    const finalized = Array.isArray(finalizedRows)
      ? finalizedRows[0]
      : finalizedRows;

    return successResponse({
      fileId: file.id,
      status: finalized?.upload_status || "completed",
      fileCount: finalized?.file_count,
    });
  } catch (error) {
    console.error("Unexpected error finalizing upload:", error);
    return serverErrorResponse("An unexpected error occurred");
  }
}
