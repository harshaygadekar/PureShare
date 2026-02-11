/**
 * API Route: GET /api/user/stats
 * Fetch authenticated user's dashboard statistics
 */

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/utils/api-response";
import { toDatabaseUserId } from "@/lib/utils/user-id";
import type { UserStats } from "@/types/database";

export async function GET() {
  const { userId } = await auth();
  const dbUserId = toDatabaseUserId(userId);

  if (!dbUserId) {
    return unauthorizedResponse();
  }

  try {
    const now = new Date().toISOString();

    // Get total shares count
    const { count: totalShares, error: totalError } = await supabaseAdmin
      .from("shares")
      .select("*", { count: "exact", head: true })
      .eq("user_id", dbUserId);

    if (totalError) throw totalError;

    // Get active shares count
    const { count: activeShares, error: activeError } = await supabaseAdmin
      .from("shares")
      .select("*", { count: "exact", head: true })
      .eq("user_id", dbUserId)
      .gt("expires_at", now);

    if (activeError) throw activeError;

    const stats: UserStats = {
      totalShares: totalShares || 0,
      activeShares: activeShares || 0,
      expiredShares: (totalShares || 0) - (activeShares || 0),
    };

    return successResponse(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return serverErrorResponse("Failed to fetch statistics");
  }
}
