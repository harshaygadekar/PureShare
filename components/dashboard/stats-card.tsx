/**
 * Stats Card Component
 * Display key metrics with animation - Light Theme
 */

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FolderOpen, Clock, Archive } from 'lucide-react';

// Icon map to avoid passing functions from Server Components
const ICON_MAP = {
    'folder-open': FolderOpen,
    'clock': Clock,
    'archive': Archive,
} as const;

type IconName = keyof typeof ICON_MAP;

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    iconName?: IconName;
    delay?: number;
    className?: string;
}

export function StatsCard({
    title,
    value,
    description,
    iconName,
    delay = 0,
    className,
}: StatsCardProps) {
    const Icon = iconName ? ICON_MAP[iconName] : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={cn(
                'group relative p-6 rounded-lg border transition-all duration-300',
                className
            )}
            style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderColor: 'var(--color-border)',
            }}
        >
            <div className="relative flex items-start justify-between">
                <div className="space-y-1">
                    <p
                        className="text-sm font-medium tracking-wide uppercase"
                        style={{ color: 'var(--color-text-tertiary)' }}
                    >
                        {title}
                    </p>
                    <motion.p
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: delay * 0.1 + 0.2 }}
                        className="text-3xl font-bold tabular-nums"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        {value}
                    </motion.p>
                    {description && (
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                            {description}
                        </p>
                    )}
                </div>

                {Icon && (
                    <div
                        className="p-2.5 rounded-lg"
                        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                    >
                        <Icon
                            className="h-5 w-5"
                            strokeWidth={1.5}
                            style={{ color: 'var(--color-text-tertiary)' }}
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
}
