/**
 * Footer Component
 * Professional big-tech style footer with 4 columns
 */

'use client';

import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { Github, Twitter, Linkedin, ArrowRight, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { href: '/features', label: 'Features' },
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/pricing', label: 'Pricing' },
    ],
    company: [
      { href: '/about', label: 'About' },
    ],
    support: [
      { href: '/help', label: 'Help Center' },
      { href: '/contact', label: 'Contact' },
    ],
  };

  const socialLinks = [
    { href: 'https://github.com', label: 'GitHub', icon: Github },
    { href: 'https://twitter.com', label: 'Twitter', icon: Twitter },
    { href: 'https://linkedin.com', label: 'LinkedIn', icon: Linkedin },
  ];

  return (
    <footer className="border-t border-border/40 bg-bg-secondary">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-5">
          {/* Logo & Newsletter */}
          <div className="col-span-2 lg:col-span-1">
            <Logo size="sm" />
            <p className="mt-4 text-sm text-secondary leading-relaxed">
              Temporary file sharing that disappears. No accounts, no tracking.
            </p>
            {/* Newsletter Signup */}
            <div className="mt-6">
              <p className="text-xs font-medium text-primary uppercase tracking-wide mb-3">
                Stay Updated
              </p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 text-sm bg-bg-primary border border-border rounded-md placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-interactive focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  className="p-2 bg-interactive text-white rounded-md hover:bg-interactive-hover transition-colors"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Product</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary hover:text-interactive transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary hover:text-interactive transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary hover:text-interactive transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Connect</h3>
            <div className="mt-4 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-bg-primary border border-border rounded-md text-secondary hover:text-interactive hover:border-interactive transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <div className="mt-4">
              <a
                href="mailto:support@pureshare.com"
                className="flex items-center gap-2 text-sm text-secondary hover:text-interactive transition-colors"
              >
                <Mail className="w-4 h-4" />
                support@pureshare.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/60">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-tertiary">
              {currentYear} PureShare. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-tertiary hover:text-secondary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-tertiary hover:text-secondary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
