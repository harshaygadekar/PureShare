/**
 * API Route: PATCH/DELETE /api/shares/[id]
 * Update or delete a share (with ownership verification)
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { hashPassword } from "@/lib/security/password";
import { deleteFiles } from "@/lib/storage/s3";
import { toDatabaseUserId } from "@/lib/utils/user-id";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
  badRequestResponse,
} from "@/lib/utils/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  const dbUserId = toDatabaseUserId(userId);
  const { id } = await params;

  if (!dbUserId) {
    return unauthorizedResponse();
  }

  // Verify share ownership
  const { data: share, error: fetchError } = await supabaseAdmin
    .from("shares")
    .select("id, user_id, expires_at")
    .eq("id", id)
    .single();

  if (fetchError || !share) {
    return notFoundResponse("Share not found");
  }

  if (share.user_id !== dbUserId) {
    return unauthorizedResponse("You do not own this share");
  }

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    // Extend expiration (in hours)
    if (typeof body.extendHours === "number" && body.extendHours > 0) {
      const currentExpiry = new Date(share.expires_at);
      currentExpiry.setHours(currentExpiry.getHours() + body.extendHours);
      updates.expires_at = currentExpiry.toISOString();
    }

    // Update password (null to remove, string to set)
    if (body.password !== undefined) {
      updates.password_hash = body.password
        ? await hashPassword(body.password)
        : null;
    }

    // Update title
    if (typeof body.title === "string") {
      updates.title = body.title.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      return badRequestResponse("No valid updates provided");
    }

    const { data, error } = await supabaseAdmin
      .from("shares")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating share:", error);
      return serverErrorResponse("Failed to update share");
    }

    return successResponse(data);
  } catch (error) {
    console.error("Error in PATCH share:", error);
    return serverErrorResponse("Failed to update share");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  const dbUserId = toDatabaseUserId(userId);
  const { id } = await params;

  if (!dbUserId) {
    return unauthorizedResponse();
  }

  // Verify share ownership
  const { data: share, error: fetchError } = await supabaseAdmin
    .from("shares")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (fetchError || !share) {
    return notFoundResponse("Share not found");
  }

  if (share.user_id !== dbUserId) {
    return unauthorizedResponse("You do not own this share");
  }

  try {
    // Get files to delete from S3
    const { data: files } = await supabaseAdmin
      .from("files")
      .select("s3_key")
      .eq("share_id", id);

    // Delete files from S3
    if (files && files.length > 0) {
      await deleteFiles(files.map((f) => f.s3_key));
    }

    // Delete share (cascades to files via FK)
    const { error } = await supabaseAdmin.from("shares").delete().eq("id", id);

    if (error) {
      console.error("Error deleting share:", error);
      return serverErrorResponse("Failed to delete share");
    }

    return successResponse({ deleted: true, id });
  } catch (error) {
    console.error("Error in DELETE share:", error);
    return serverErrorResponse("Failed to delete share");
  }
}
