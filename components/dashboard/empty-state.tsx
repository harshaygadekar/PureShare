/**
 * Empty State Component
 * Shown when user has no shares - Light Theme
 */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Upload, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
}

export function EmptyState({
    title = 'No shares yet',
    description = 'Create your first secure share to start sharing files.',
    actionLabel = 'Create Share',
    actionHref = '/upload',
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-center justify-center py-20 px-6 rounded-lg border border-dashed"
            style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderColor: 'var(--color-border)',
            }}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="p-4 rounded-lg mb-6"
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
                <Upload
                    className="h-8 w-8"
                    strokeWidth={1.5}
                    style={{ color: 'var(--color-text-tertiary)' }}
                />
            </motion.div>

            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
            >
                {title}
            </motion.h3>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-sm text-center max-w-sm mb-8"
                style={{ color: 'var(--color-text-secondary)' }}
            >
                {description}
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Button asChild className="group">
                    <Link href={actionHref}>
                        {actionLabel}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </Button>
            </motion.div>
        </motion.div>
    );
}
