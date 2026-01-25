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
  sm: 'max-w-3xl',       // 768px
  md: 'max-w-5xl',       // 1024px
  lg: 'max-w-[1280px]',  // 1280px - Apple standard
  xl: 'max-w-[1280px]',  // 1280px - Apple standard
  full: 'max-w-full',
};

export function Container({ children, className, size = 'xl' }: ContainerProps) {
  return (
    <div
      className={cn(
        // Apple margins: 16px mobile, 22px tablet/desktop
        'mx-auto w-full px-4 md:px-[22px]',
        containerSizes[size],
        className
      )}
    >
      {children}
    </div>
  );
}
