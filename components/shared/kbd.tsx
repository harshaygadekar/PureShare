/**
 * Kbd Component
 * Display keyboard shortcuts
 * Apple-inspired minimal styling
 */

import { cn } from '@/lib/utils';

interface KbdProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export function Kbd({ children, className, size = 'md' }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center border border-border bg-surface px-1.5 font-mono font-medium text-secondary',
        size === 'sm' ? 'h-5 min-w-5 text-xs' : 'h-6 min-w-6 text-sm',
        className
      )}
    >
      {children}
    </kbd>
  );
}

// Helper for command key (⌘ on Mac, Ctrl on Windows)
export function CmdKey({ className }: { className?: string }) {
  return <Kbd className={className}>⌘</Kbd>;
}

// Helper for common shortcuts
export function KbdShortcut({
  keys,
  className,
}: {
  keys: string[];
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {keys.map((key, index) => (
        <Kbd key={index}>{key}</Kbd>
      ))}
    </span>
  );
}
