/**
 * My Shares Page
 * List all user shares with filtering - Light Theme
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShareList } from '@/components/dashboard/share-list';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ShareWithFiles } from '@/types/database';

type FilterStatus = 'all' | 'active' | 'expired';

export default function SharesPage() {
    const [shares, setShares] = useState<ShareWithFiles[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterStatus>('all');

    const fetchShares = useCallback(async () => {
        setIsLoading(true);
        try {
            const url = filter === 'all'
                ? '/api/user/shares'
                : `/api/user/shares?status=${filter}`;
            const res = await fetch(url);
            const data = await res.json();
            setShares(data.shares || []);
        } catch (error) {
            console.error('Failed to fetch shares:', error);
        } finally {
            setIsLoading(false);
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
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    My Shares
                </h1>
                <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
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

            {/* Share List */}
            <ShareList shares={shares} isLoading={isLoading} onDelete={handleDelete} />
        </div>
    );
}
