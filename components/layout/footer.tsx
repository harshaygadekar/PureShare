/**
 * Footer Component
 * Minimal footer with essential links
 * Apple-inspired clean design
 */

import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About' },
      { href: '/pricing', label: 'Pricing' },
    ],
    legal: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
    support: [
      { href: '/help', label: 'Help' },
      { href: '/contact', label: 'Contact' },
    ],
  };

  return (
    <footer className="border-t border-border/40 bg-surface">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Logo size="sm" />
            <p className="mt-4 max-w-xs text-sm text-secondary">
              Temporary file sharing that disappears. No accounts, no tracking, just upload and share.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mt-6 text-sm font-semibold text-foreground">Support</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 border-t border-border/40 pt-8">
          <p className="text-center text-sm text-tertiary">
            {currentYear} PureShare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
