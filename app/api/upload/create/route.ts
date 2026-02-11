/**
 * API Route: POST /api/upload/create
 * Creates a new share and returns the share link
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { generateShareLink } from "@/lib/security/share-link";
import { hashPassword } from "@/lib/security/password";
import { createShareSchema } from "@/lib/validations/share";
import {
  successResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/utils/api-response";
import { toDatabaseUserId } from "@/lib/utils/user-id";
import type { CreateShareResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user (optional - allows anonymous shares)
    const { userId } = await auth();

    const body = await request.json();

    // Validate input
    const validation = createShareSchema.safeParse(body);
    if (!validation.success) {
      return badRequestResponse(validation.error.issues[0].message);
    }

    const { password, expirationHours, expirationProfile } = validation.data;
    const dbUserId = toDatabaseUserId(userId);

    // Generate unique share link
    let shareLink: string;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      shareLink = generateShareLink();

      // Check if share link already exists
      const { data: existing } = await supabaseAdmin
        .from("shares")
        .select("id")
        .eq("share_link", shareLink)
        .single();

      if (!existing) break;
      attempts++;
    }

    if (attempts === maxAttempts) {
      return serverErrorResponse("Failed to generate unique share link");
    }

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours!);

    // Hash password if provided
    const passwordHash = password ? await hashPassword(password) : null;

    // Only set owner when that UUID exists in users table (shares.user_id FK -> users.id).
    let ownerUserId: string | null = null;
    if (dbUserId) {
      const { data: ownerRecord, error: ownerLookupError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("id", dbUserId)
        .maybeSingle();

      if (ownerLookupError) {
        console.error("Error looking up owner user:", ownerLookupError);
      } else if (ownerRecord) {
        ownerUserId = dbUserId;
      }
    }

    // Insert share into database
    const { data: share, error } = await supabaseAdmin
      .from("shares")
      .insert({
        share_link: shareLink!,
        password_hash: passwordHash,
        expires_at: expiresAt.toISOString(),
        file_count: 0,
        has_image: false,
        has_video: false,
        expiration_profile: expirationProfile,
        expiration_hours_selected: expirationHours,
        user_id: ownerUserId,
        title: body.title || null,
      })
      .select("id, share_link, expires_at")
      .single();

    if (error) {
      console.error("Error creating share:", error);
      return serverErrorResponse("Failed to create share");
    }

    const response: CreateShareResponse = {
      shareLink: share.share_link,
      expiresAt: share.expires_at,
      shareId: share.id,
    };

    return successResponse(response, 201);
  } catch (error) {
    console.error("Unexpected error in create share:", error);
    return serverErrorResponse("An unexpected error occurred");
  }
}
