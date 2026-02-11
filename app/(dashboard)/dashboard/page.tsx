/**
 * Dashboard Overview Page
 * Shows stats and recent shares - Light Theme
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/db/supabase";
import { toDatabaseUserId } from "@/lib/utils/user-id";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ShareList } from "@/components/dashboard/share-list";
import { ArrowRight } from "lucide-react";
import type { UserStats, ShareWithFiles } from "@/types/database";

async function getUserStats(userId: string): Promise<UserStats> {
  const now = new Date().toISOString();

  const [totalResult, activeResult] = await Promise.all([
    supabaseAdmin
      .from("shares")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabaseAdmin
      .from("shares")
      .select("*", { count: "exact", head: true })
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
    .select("*, files(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data as ShareWithFiles[]) || [];
}

export default async function DashboardPage() {
  const { userId } = await auth();
  const dbUserId = toDatabaseUserId(userId);

  if (!dbUserId) {
    redirect("/");
  }

  const [stats, recentShares] = await Promise.all([
    getUserStats(dbUserId),
    getRecentShares(dbUserId),
  ]);

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
