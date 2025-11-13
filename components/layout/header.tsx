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
  const [isTransitioning, setIsTransitioning] = useState(false);
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
    // Trigger transition state
    setIsTransitioning(true);
    setActiveSection(sectionId);

    // Collapse the pill after selection
    setHovering(false);

    // Smooth scroll to section
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
  };

  const activeItem = NAV_ITEMS.find((item: NavItem) => item.id === activeSection);

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-all duration-200',
        scrolled
          ? 'border-b border-border/40 bg-background/80 backdrop-blur-md'
          : 'bg-transparent'
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

        {/* Navigation - Center (PillBase) */}
        <motion.nav
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className="relative rounded-full hidden md:block"
          style={{
            width: pillWidth,
            height: '56px',
            background: `
              linear-gradient(135deg,
                #fcfcfd 0%,
                #f8f8fa 15%,
                #f3f4f6 30%,
                #eeeff2 45%,
                #e9eaed 60%,
                #e4e5e8 75%,
                #dee0e3 90%,
                #e2e3e6 100%
              )
            `,
            boxShadow: expanded
              ? `
                0 2px 4px rgba(0, 0, 0, 0.08),
                0 6px 12px rgba(0, 0, 0, 0.12),
                0 12px 24px rgba(0, 0, 0, 0.14),
                0 24px 48px rgba(0, 0, 0, 0.10),
                inset 0 2px 2px rgba(255, 255, 255, 0.8),
                inset 0 -3px 8px rgba(0, 0, 0, 0.12),
                inset 3px 3px 8px rgba(0, 0, 0, 0.10),
                inset -3px 3px 8px rgba(0, 0, 0, 0.09),
                inset 0 -1px 2px rgba(0, 0, 0, 0.08)
              `
              : isTransitioning
              ? `
                0 3px 6px rgba(0, 0, 0, 0.10),
                0 8px 16px rgba(0, 0, 0, 0.08),
                0 16px 32px rgba(0, 0, 0, 0.06),
                0 1px 2px rgba(0, 0, 0, 0.10),
                inset 0 2px 1px rgba(255, 255, 255, 0.85),
                inset 0 -2px 6px rgba(0, 0, 0, 0.08),
                inset 2px 2px 8px rgba(0, 0, 0, 0.06),
                inset -2px 2px 8px rgba(0, 0, 0, 0.05),
                inset 0 0 1px rgba(0, 0, 0, 0.12),
                inset 0 0 20px rgba(255, 255, 255, 0.15)
              `
              : `
                0 3px 6px rgba(0, 0, 0, 0.12),
                0 8px 16px rgba(0, 0, 0, 0.10),
                0 16px 32px rgba(0, 0, 0, 0.08),
                0 1px 2px rgba(0, 0, 0, 0.12),
                inset 0 2px 1px rgba(255, 255, 255, 0.7),
                inset 0 -2px 6px rgba(0, 0, 0, 0.10),
                inset 2px 2px 8px rgba(0, 0, 0, 0.08),
                inset -2px 2px 8px rgba(0, 0, 0, 0.07),
                inset 0 0 1px rgba(0, 0, 0, 0.15)
              `,
            overflow: 'hidden',
            transition: 'box-shadow 0.3s ease-out',
          }}
        >
          {/* Lighting effects */}
          <div
            className="absolute inset-x-0 top-0 rounded-t-full pointer-events-none"
            style={{
              height: '2px',
              background: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 5%, rgba(255, 255, 255, 1) 15%, rgba(255, 255, 255, 1) 85%, rgba(255, 255, 255, 0.95) 95%, rgba(255, 255, 255, 0) 100%)',
              filter: 'blur(0.3px)',
            }}
          />

          <div
            className="absolute inset-x-0 top-0 rounded-full pointer-events-none"
            style={{
              height: '55%',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.25) 30%, rgba(255, 255, 255, 0.10) 60%, rgba(255, 255, 255, 0) 100%)',
            }}
          />

          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.20) 20%, rgba(255, 255, 255, 0.08) 40%, rgba(255, 255, 255, 0) 65%)',
            }}
          />

          {expanded && (
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                left: '18%',
                top: '16%',
                width: '140px',
                height: '14px',
                background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.70) 0%, rgba(255, 255, 255, 0.35) 40%, rgba(255, 255, 255, 0.10) 70%, rgba(255, 255, 255, 0) 100%)',
                filter: 'blur(4px)',
                transform: 'rotate(-12deg)',
              }}
            />
          )}

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
                      style={{
                        fontSize: '15.5px',
                        fontWeight: 680,
                        color: '#1a1a1a',
                        letterSpacing: '0.45px',
                        whiteSpace: 'nowrap',
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                        WebkitFontSmoothing: 'antialiased',
                        textShadow: `
                          0 1px 0 rgba(0, 0, 0, 0.35),
                          0 -1px 0 rgba(255, 255, 255, 0.8),
                          1px 1px 0 rgba(0, 0, 0, 0.18),
                          -1px 1px 0 rgba(0, 0, 0, 0.15)
                        `,
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
                      className="relative cursor-pointer transition-all duration-200"
                      style={{
                        fontSize: isActive ? '15.5px' : '15px',
                        fontWeight: isActive ? 680 : 510,
                        color: isActive ? '#1a1a1a' : '#656565',
                        textDecoration: 'none',
                        letterSpacing: '0.45px',
                        background: 'transparent',
                        border: 'none',
                        padding: '10px 16px',
                        outline: 'none',
                        whiteSpace: 'nowrap',
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                        WebkitFontSmoothing: 'antialiased',
                        transform: isActive ? 'translateY(-1.5px)' : 'translateY(0)',
                        textShadow: isActive
                          ? `
                            0 1px 0 rgba(0, 0, 0, 0.35),
                            0 -1px 0 rgba(255, 255, 255, 0.8),
                            1px 1px 0 rgba(0, 0, 0, 0.18),
                            -1px 1px 0 rgba(0, 0, 0, 0.15)
                          `
                          : `
                            0 1px 0 rgba(0, 0, 0, 0.22),
                            0 -1px 0 rgba(255, 255, 255, 0.65),
                            1px 1px 0 rgba(0, 0, 0, 0.12),
                            -1px 1px 0 rgba(0, 0, 0, 0.10)
                          `,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.color = '#3a3a3a';
                          e.currentTarget.style.transform = 'translateY(-0.5px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.color = '#656565';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
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
