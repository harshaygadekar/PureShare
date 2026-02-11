/**
 * Share Card Component
 * Display a single share with actions - Light Theme
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import {
    Copy,
    ExternalLink,
    Lock,
    MoreVertical,
    Trash2,
    FileIcon,
    Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { ShareWithFiles } from '@/types/database';

interface ShareCardProps {
    share: ShareWithFiles;
    index?: number;
    onDelete?: (id: string) => void;
}

export function ShareCard({ share, index = 0, onDelete }: ShareCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [copied, setCopied] = useState(false);

    const isExpired = isPast(new Date(share.expires_at));
    const hasPassword = !!share.password_hash;

    const shareUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}/share/${share.share_link}`
            : `/share/${share.share_link}`;

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('Link copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy link');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this share? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/shares/${share.id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Share deleted successfully');
                onDelete?.(share.id);
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to delete share');
            }
        } catch {
            toast.error('Failed to delete share');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={cn(
                'group relative p-5 rounded-lg border transition-all duration-300 hover:shadow-md',
                isExpired && 'opacity-60'
            )}
            style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderColor: 'var(--color-border)',
            }}
        >
            {/* Status indicator bar */}
            <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-lg"
                style={{
                    backgroundColor: isExpired
                        ? 'var(--color-text-tertiary)'
                        : 'var(--color-interactive)',
                }}
            />

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 pr-2">
                    <h3
                        className="font-medium truncate"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        {share.title || `Share ${share.share_link.slice(0, 8)}`}
                    </h3>
                    <p
                        className="text-xs mt-1"
                        style={{ color: 'var(--color-text-tertiary)' }}
                    >
                        Created{' '}
                        {formatDistanceToNow(new Date(share.created_at), { addSuffix: true })}
                    </p>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={copyLink} className="cursor-pointer">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy link
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open share
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Meta info */}
            <div
                className="flex items-center gap-3 text-sm mb-4"
                style={{ color: 'var(--color-text-secondary)' }}
            >
                <span className="flex items-center gap-1.5">
                    <FileIcon className="h-3.5 w-3.5" />
                    {share.file_count} file{share.file_count !== 1 ? 's' : ''}
                </span>
                {hasPassword && (
                    <span className="flex items-center gap-1.5" style={{ color: 'var(--color-warning)' }}>
                        <Lock className="h-3.5 w-3.5" />
                        Protected
                    </span>
                )}
            </div>

            {/* Footer */}
            <div
                className="flex items-center justify-between pt-3 border-t"
                style={{ borderColor: 'var(--color-border)' }}
            >
                <span
                    className="text-xs"
                    style={{
                        color: isExpired
                            ? 'var(--color-error)'
                            : 'var(--color-text-tertiary)',
                    }}
                >
                    {isExpired
                        ? 'Expired'
                        : `Expires ${format(new Date(share.expires_at), 'MMM d, h:mm a')}`}
                </span>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyLink}
                    className={cn(
                        'h-7 text-xs gap-1.5',
                        'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                    )}
                    style={{
                        color: copied ? 'var(--color-success)' : 'var(--color-interactive)',
                    }}
                >
                    {copied ? (
                        <>
                            <Check className="h-3 w-3" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="h-3 w-3" />
                            Copy
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}
