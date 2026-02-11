/**
 * Header Component
 * Apple-style Navigation with Mega Menu
 * Flat, minimal design with blur backdrop on scroll
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FiMenu, FiX } from 'react-icons/fi';

interface NavItem {
  label: string;
  href: string;
  id?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', id: 'home' },
  { label: 'Features', href: '/#features', id: 'features' },
  { label: 'How It Works', href: '/#how-it-works', id: 'how-it-works' },
  { label: 'About', href: '/about' },
];

const SIGNED_IN_NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', id: 'home' },
  { label: 'Dashboard', href: '/dashboard', id: 'dashboard' },
  { label: 'About', href: '/about' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);

    // Handle anchor links
    if (href.startsWith('/#')) {
      const elementId = href.substring(2);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <>
      <header
        className={cn(
          'fixed left-0 right-0 top-0 z-50 transition-all duration-300 border-b',
          scrolled
            ? 'backdrop-apple border-[var(--color-border)]'
            : 'bg-[var(--color-bg-primary)] border-[var(--color-border)]'
        )}
      >
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:px-[22px]"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <span className="bg-gradient-to-r from-[var(--color-interactive)] to-[var(--color-interactive-hover)] bg-clip-text text-transparent">
              PureShare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => handleNavClick(item.href)}
                className="text-sm font-medium transition-colors hover:text-[var(--color-interactive)]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            {/* Desktop Auth */}
            <div className="hidden md:flex md:items-center md:gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    className="text-sm font-medium transition-colors hover:text-[var(--color-interactive)]"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Sign in
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="btn-primary rounded-full px-5 py-2 text-sm">
                    Get Started
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium transition-colors hover:text-[var(--color-interactive)]"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Dashboard
                </Link>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'h-8 w-8',
                    },
                  }}
                />
              </SignedIn>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
              style={{ color: 'var(--color-text-primary)' }}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[var(--color-bg-primary)] pt-16 md:hidden"
          >
            <nav className="flex flex-col p-6" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className="block border-b py-4 text-lg font-medium"
                    style={{
                      color: 'var(--color-text-primary)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Auth */}
              <div className="mt-8 space-y-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="btn-primary w-full rounded-full py-3 text-base">
                      Get Started
                    </button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <button className="btn-secondary w-full rounded-full py-3 text-base">
                      Sign in
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center gap-4 py-4">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: 'h-10 w-10',
                        },
                      }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Manage account
                    </span>
                  </div>
                </SignedIn>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
}
