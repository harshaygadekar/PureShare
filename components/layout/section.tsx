/**
 * Section Component
 * Consistent vertical spacing for page sections
 * Apple-inspired minimal design
 */

import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
}

const sectionSpacing = {
  sm: 'py-12 sm:py-16',           // 48px/64px
  md: 'py-16 sm:py-20',           // 64px/80px
  lg: 'py-20 sm:py-24 lg:py-32',  // 80px/96px/128px
  xl: 'py-24 sm:py-32 lg:py-40',  // 96px/128px/160px
};

export function Section({
  children,
  className,
  spacing = 'lg',
  id,
}: SectionProps) {
  return (
    <section id={id} className={cn(sectionSpacing[spacing], className)}>
      {children}
    </section>
  );
}
