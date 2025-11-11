/**
 * Logo Component
 * Minimal, clean logo design
 * Text-based with optional icon
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

const logoSizes = {
  sm: 'text-base',      // 16px
  md: 'text-lg',        // 18px
  lg: 'text-xl',        // 20px
};

export function Logo({ className, size = 'md', href = '/' }: LogoProps) {
  const content = (
    <div
      className={cn(
        'flex items-center gap-2 font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80',
        logoSizes[size],
        className
      )}
    >
      {/* Simple geometric icon - squared, minimal */}
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Squared icon representing "share" */}
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M12 8V16M8 12H16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
        />
      </svg>
      <span>PureShare</span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
