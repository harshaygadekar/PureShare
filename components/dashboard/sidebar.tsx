/**
 * Dashboard Sidebar Component
 * Navigation with active state - Light Theme
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, FolderOpen, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
    {
        label: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'My Shares',
        href: '/dashboard/shares',
        icon: FolderOpen,
    },
    {
        label: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside
            className="w-64 border-r p-6 hidden md:flex md:flex-col"
            style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderColor: 'var(--color-border)',
            }}
        >
            {/* Logo */}
            <Link
                href="/"
                className="text-xl font-semibold mb-8"
                style={{ color: 'var(--color-interactive)' }}
            >
                PureShare
            </Link>

            {/* New Share Button */}
            <Button asChild className="w-full mb-6">
                <Link href="/upload">
                    <Plus className="h-4 w-4 mr-2" />
                    New Share
                </Link>
            </Button>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive =
                        item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors'
                            )}
                            style={{
                                color: isActive
                                    ? 'var(--color-text-primary)'
                                    : 'var(--color-text-secondary)',
                                backgroundColor: isActive
                                    ? 'var(--color-bg-secondary)'
                                    : 'transparent',
                            }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 rounded-lg"
                                    style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                                    initial={false}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 500,
                                        damping: 35,
                                    }}
                                />
                            )}
                            <item.icon
                                className="relative h-4 w-4"
                                style={{
                                    color: isActive
                                        ? 'var(--color-interactive)'
                                        : 'var(--color-text-tertiary)',
                                }}
                                strokeWidth={1.5}
                            />
                            <span
                                className="relative"
                                style={{
                                    color: isActive
                                        ? 'var(--color-text-primary)'
                                        : 'var(--color-text-secondary)',
                                }}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div
                className="pt-6 border-t mt-auto"
                style={{ borderColor: 'var(--color-border)' }}
            >
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    Secure file sharing with automatic expiration.
                </p>
            </div>
        </aside>
    );
}
