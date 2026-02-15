/**
 * Dashboard Overview Page
 * Shows stats and recent shares - Light Theme
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/db/supabase";
import { resolveDatabaseUserId } from "@/lib/db/user-resolution";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ShareList } from "@/components/dashboard/share-list";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { UserStats, ShareWithFiles } from "@/types/database";

async function getUserStats(userId: string): Promise<UserStats> {
  const now = new Date().toISOString();

  const [totalResult, activeResult] = await Promise.all([
    supabaseAdmin
      .from("shares")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabaseAdmin
      .from("shares")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gt("expires_at", now),
  ]);

  return {
    totalShares: totalResult.count || 0,
    activeShares: activeResult.count || 0,
    expiredShares: (totalResult.count || 0) - (activeResult.count || 0),
  };
}

async function getRecentShares(
  userId: string,
  limit = 6,
): Promise<ShareWithFiles[]> {
  const { data } = await supabaseAdmin
    .from("shares")
    .select(
      "id, share_link, password_hash, expires_at, created_at, file_count, has_image, has_video, expiration_profile, expiration_hours_selected, user_id, title",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data as ShareWithFiles[]) || [];
}

export default async function DashboardPage() {
  const { userId } = await auth();
  const dbUserId = await resolveDatabaseUserId(userId, {
    allowProvision: true,
  });

  if (!dbUserId) {
    redirect("/");
  }

  let stats: UserStats = {
    totalShares: 0,
    activeShares: 0,
    expiredShares: 0,
  };
  let recentShares: ShareWithFiles[] = [];
  let hasLoadError = false;

  try {
    [stats, recentShares] = await Promise.all([
      getUserStats(dbUserId),
      getRecentShares(dbUserId),
    ]);
  } catch (error) {
    console.error("Failed loading dashboard overview:", error);
    hasLoadError = true;
  }

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          Dashboard
        </h1>
        <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Welcome back! Here&apos;s an overview of your shares.
        </p>
      </div>

      {/* Stats Grid */}
      {hasLoadError && (
        <div
          className="rounded-lg border px-4 py-3 flex items-start gap-3"
          style={{
            borderColor: "var(--color-error)",
            backgroundColor: "var(--color-error-bg)",
          }}
        >
          <AlertTriangle
            className="h-4 w-4 mt-0.5"
            style={{ color: "var(--color-error)" }}
          />
          <p className="text-sm" style={{ color: "var(--color-error)" }}>
            We could not load your latest dashboard data. Please refresh and try
            again.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Total Shares"
          value={stats.totalShares}
          iconName="folder-open"
          delay={0}
        />
        <StatsCard
          title="Active Shares"
          value={stats.activeShares}
          iconName="clock"
          description={
            stats.expiredShares > 0
              ? `${stats.expiredShares} expired`
              : undefined
          }
          delay={1}
        />
        <StatsCard
          title="Expired Shares"
          value={stats.expiredShares}
          iconName="archive"
          delay={2}
        />
      </div>

      {/* Recent Shares */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Recent Shares
          </h2>
          {recentShares.length > 0 && (
            <Link
              href="/dashboard/shares"
              className="group flex items-center gap-1 text-sm transition-colors"
              style={{ color: "var(--color-interactive)" }}
            >
              View all
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
        <ShareList shares={recentShares} />
      </section>
    </div>
  );
}
