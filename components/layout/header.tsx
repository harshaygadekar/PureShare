/**
 * Header Component
 * Apple-inspired fixed header with backdrop blur
 * 44px height (Apple standard)
 * Minimal, clean navigation
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/upload', label: 'Upload' },
  ];

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-all duration-200',
        scrolled
          ? 'border-b border-border/40 bg-background/80 backdrop-blur-md'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-11 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo - Left */}
        <div className="flex-shrink-0">
          <Logo size="sm" />
        </div>

        {/* Navigation - Center */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-accent',
                pathname === link.href
                  ? 'text-foreground'
                  : 'text-secondary'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA - Right */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden text-sm font-medium transition-colors hover:text-accent sm:block">
            Sign in
          </Link>
          <Button asChild size="sm" className="h-8">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
