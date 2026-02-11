/**
 * Share List Component
 * Grid layout with loading skeleton - Light Theme
 */

'use client';

import { AnimatePresence } from 'framer-motion';
import { ShareCard } from './share-card';
import { EmptyState } from './empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { ShareWithFiles } from '@/types/database';

interface ShareListProps {
    shares: ShareWithFiles[];
    isLoading?: boolean;
    onDelete?: (id: string) => void;
}

export function ShareList({ shares, isLoading, onDelete }: ShareListProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="p-5 space-y-4 rounded-lg border"
                        style={{
                            backgroundColor: 'var(--color-bg-primary)',
                            borderColor: 'var(--color-border)',
                        }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-8 w-8" />
                        </div>
                        <div className="flex gap-3">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <div
                            className="border-t pt-3"
                            style={{ borderColor: 'var(--color-border)' }}
                        >
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-7 w-16" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (shares.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
                {shares.map((share, index) => (
                    <ShareCard
                        key={share.id}
                        share={share}
                        index={index}
                        onDelete={onDelete}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
