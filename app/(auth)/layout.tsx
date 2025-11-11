/**
 * Auth Layout
 * Minimal layout for authentication pages
 * Centered forms with subtle branding
 */

import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header with logo */}
      <header className="border-b border-border/40 bg-surface">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Logo size="sm" />
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-surface">
        <div className="mx-auto max-w-[1440px] px-4 py-6 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-tertiary">
            {new Date().getFullYear()} PureShare. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
