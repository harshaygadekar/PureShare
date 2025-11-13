/**
 * Header Component
 * Premium 3D Pill Navigation with Liquid Glass Aesthetic
 * Integrates PillBase with Clerk authentication
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  id: string;
  href?: string;
}

// Navigation items - defined outside component to prevent recreation
const NAV_ITEMS: NavItem[] = [
  { label: 'Home', id: 'home' },
  { label: 'Features', id: 'features' },
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'Testimonials', id: 'testimonials' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Spring animations for smooth motion
  const pillWidth = useSpring(160, { stiffness: 220, damping: 25, mass: 1 });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);

      // Detect active section based on scroll position
      const sections = NAV_ITEMS.map((item: NavItem) => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(NAV_ITEMS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle hover expansion
  // Note: setExpanded is intentionally called in response to hovering changes
  // This syncs the expanded state with hover state and manages delayed collapse
  useEffect(() => {
    if (hovering) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpanded(true);
      pillWidth.set(680);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setExpanded(false);
        pillWidth.set(160);
      }, 600);
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [hovering, pillWidth]);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);

    // Collapse the pill after selection
    setHovering(false);

    // Smooth scroll to section
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activeItem = NAV_ITEMS.find((item: NavItem) => item.id === activeSection);

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-white/10 glass'
          : 'glass-subtle'
      )}
    >
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo - Left */}
        <div className="flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
              PureShare
            </h1>
          </motion.div>
        </div>

        {/* Navigation - Center (Liquid Glass Pill) */}
        <motion.nav
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className={cn(
            "relative rounded-full hidden md:block glass-strong overflow-hidden",
            expanded && "shadow-2xl"
          )}
          style={{
            width: pillWidth,
            height: '56px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >

          {/* Navigation items */}
          <div className="relative z-10 h-full flex items-center justify-center px-6"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro", Poppins, sans-serif',
            }}
          >
            {/* Collapsed state */}
            {!expanded && (
              <div className="flex items-center relative">
                <AnimatePresence mode="wait">
                  {activeItem && (
                    <motion.span
                      key={activeItem.id}
                      initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                      transition={{
                        duration: 0.35,
                        ease: [0.4, 0.0, 0.2, 1]
                      }}
                      className="text-white font-semibold"
                      style={{
                        fontSize: '14px',
                        letterSpacing: '0.3px',
                        whiteSpace: 'nowrap',
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                      }}
                    >
                      {activeItem.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Expanded state */}
            {expanded && (
              <div className="flex items-center justify-evenly w-full">
                {NAV_ITEMS.map((item: NavItem, index: number) => {
                  const isActive = item.id === activeSection;

                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{
                        delay: index * 0.08,
                        duration: 0.25,
                        ease: 'easeOut'
                      }}
                      onClick={() => handleSectionClick(item.id)}
                      className={cn(
                        "relative cursor-pointer px-4 py-2 rounded-lg transition-all duration-200",
                        isActive ? "text-white font-semibold" : "text-white/70 font-medium hover:text-white/90"
                      )}
                      style={{
                        fontSize: '14px',
                        letterSpacing: '0.3px',
                        background: isActive ? 'rgba(10, 132, 255, 0.2)' : 'transparent',
                        border: 'none',
                        outline: 'none',
                        whiteSpace: 'nowrap',
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                      }}
                    >
                      {item.label}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.nav>

        {/* Authentication - Right */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="hidden text-sm font-medium transition-colors hover:text-accent sm:block text-foreground">
                Sign in
              </button>
            </SignInButton>

            <SignInButton mode="modal">
              <div>
                <LiquidButton size="sm" className="h-9">
                  Get Started
                </LiquidButton>
              </div>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'h-10 w-10 border-2 border-accent/20',
                  userButtonPopoverCard: 'shadow-lg',
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
