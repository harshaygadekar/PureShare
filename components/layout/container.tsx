/**
 * Container Component
 * Max-width wrapper with consistent padding
 * Apple-inspired, minimal, responsive
 */

import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const containerSizes = {
  sm: 'max-w-3xl',      // 768px
  md: 'max-w-5xl',      // 1024px
  lg: 'max-w-7xl',      // 1280px
  xl: 'max-w-[1440px]', // 1440px - Apple standard
  full: 'max-w-full',
};

export function Container({ children, className, size = 'xl' }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        containerSizes[size],
        className
      )}
    >
      {children}
    </div>
  );
}
