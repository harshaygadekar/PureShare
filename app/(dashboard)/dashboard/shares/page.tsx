/**
 * My Shares Page
 * List all user shares with filtering - Light Theme
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ShareList } from "@/components/dashboard/share-list";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import type { ShareWithFiles } from "@/types/database";

type FilterStatus = "all" | "active" | "expired";

export default function SharesPage() {
  const [shares, setShares] = useState<ShareWithFiles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);
  const latestRequestRef = useRef(0);

  const fetchShares = useCallback(async () => {
    const requestId = ++latestRequestRef.current;
    const shouldUseInitialLoader = !hasLoadedOnceRef.current;

    if (shouldUseInitialLoader) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setErrorMessage(null);

    try {
      const url =
        filter === "all"
          ? "/api/user/shares"
          : `/api/user/shares?status=${filter}`;

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch shares");
      }

      if (requestId === latestRequestRef.current) {
        setShares(data.shares || []);
      }
    } catch (error) {
      console.error("Failed to fetch shares:", error);
      if (requestId === latestRequestRef.current) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to fetch shares. Please try again.",
        );
      }
    } finally {
      if (requestId === latestRequestRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
        hasLoadedOnceRef.current = true;
      }
    }
  }, [filter]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  const handleDelete = (id: string) => {
    setShares((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          My Shares
        </h1>
        <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Manage and view all your file shares.
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as FilterStatus)}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {isRefreshing && !isLoading && (
        <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
          Updating shares...
        </p>
      )}

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border p-3 flex items-center justify-between gap-4"
          style={{
            borderColor: "var(--color-error)",
            backgroundColor: "var(--color-error-bg)",
          }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle
              className="h-4 w-4"
              style={{ color: "var(--color-error)" }}
            />
            <p className="text-sm" style={{ color: "var(--color-error)" }}>
              {errorMessage}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => fetchShares()}>
            Retry
          </Button>
        </motion.div>
      )}

      {/* Share List */}
      <ShareList
        shares={shares}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  );
}
