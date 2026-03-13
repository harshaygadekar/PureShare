/**
 * API Route: PATCH/DELETE /api/shares/[id]
 * Update or delete a share (with ownership verification)
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { resolveDatabaseUserId } from "@/lib/db/user-resolution";
import { hashPassword } from "@/lib/security/password";
import { deleteFiles } from "@/lib/storage/s3";
import { SHARE_CONFIG } from "@/config/constants";
import { updateShareSchema } from "@/lib/validations/share";
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
  const dbUserId = await resolveDatabaseUserId(userId, {
    allowProvision: false,
  });
  const { id } = await params;

  if (!dbUserId) {
    return unauthorizedResponse();
  }

  // Verify share ownership
  const { data: share, error: fetchError } = await supabaseAdmin
    .from("shares")
    .select("id, user_id, expires_at, expiration_profile")
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
    const validation = updateShareSchema.safeParse(body);

    if (!validation.success) {
      return badRequestResponse(validation.error.issues[0].message);
    }

    const payload = validation.data;
    const updates: Record<string, unknown> = {};

    // Extend expiration (in hours)
    if (typeof payload.extendHours === "number") {
      const allowedOptions =
        share.expiration_profile === "video"
          ? SHARE_CONFIG.videoExpirationOptionsHours
          : SHARE_CONFIG.standardExpirationOptionsHours;

      if (!allowedOptions.includes(payload.extendHours)) {
        return badRequestResponse(
          `Invalid expiration extension for ${share.expiration_profile} shares`,
        );
      }

      const now = new Date();
      const currentExpiry = new Date(share.expires_at);
      const extensionBase = currentExpiry > now ? currentExpiry : now;
      const nextExpiry = new Date(extensionBase);
      nextExpiry.setHours(nextExpiry.getHours() + payload.extendHours);

      const maxAllowedExpiry = new Date(now);
      maxAllowedExpiry.setHours(
        maxAllowedExpiry.getHours() + SHARE_CONFIG.maxExpirationDays * 24,
      );

      if (nextExpiry > maxAllowedExpiry) {
        return badRequestResponse(
          `Expiration cannot exceed ${SHARE_CONFIG.maxExpirationDays} days from now`,
        );
      }

      updates.expires_at = nextExpiry.toISOString();
    }

    // Update password (null to remove, string to set)
    if (payload.password !== undefined) {
      updates.password_hash = payload.password
        ? await hashPassword(payload.password)
        : null;
    }

    // Update title
    if (payload.title !== undefined) {
      updates.title = payload.title;
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
  const dbUserId = await resolveDatabaseUserId(userId, {
    allowProvision: false,
  });
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
