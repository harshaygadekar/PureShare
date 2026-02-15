/**
 * API Route: GET /api/user/shares
 * Fetch authenticated user's shares with pagination
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { resolveDatabaseUserId } from "@/lib/db/user-resolution";
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/utils/api-response";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  const dbUserId = await resolveDatabaseUserId(userId, {
    allowProvision: true,
  });

  if (!dbUserId) {
    return unauthorizedResponse();
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const status = searchParams.get("status"); // 'active', 'expired', 'all'

  const offset = (page - 1) * limit;
  const now = new Date().toISOString();

  let query = supabaseAdmin
    .from("shares")
    .select(
      "id, share_link, password_hash, expires_at, created_at, file_count, has_image, has_video, expiration_profile, expiration_hours_selected, user_id, title",
      { count: "exact" },
    )
    .eq("user_id", dbUserId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Filter by status
  if (status === "active") {
    query = query.gt("expires_at", now);
  } else if (status === "expired") {
    query = query.lte("expires_at", now);
  }

  const { data: shares, error, count } = await query;

  if (error) {
    console.error("Error fetching shares:", error);
    return serverErrorResponse("Failed to fetch shares");
  }

  return successResponse({
    shares: shares || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}
