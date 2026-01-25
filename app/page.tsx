'use client';

/**
 * Home Page - Landing with Scroll-Morph Hero
 * Clean hero with text centered inside circle animation
 */

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import IntroAnimation from '@/components/ui/scroll-morph-hero';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FiArrowRight } from 'react-icons/fi';

export default function HomePage() {
  const [showCTA, setShowCTA] = useState(false);

  // Wait for intro animation to complete (scatter → line → circle takes ~2.5s)
  useEffect(() => {
    const ctaTimer = setTimeout(() => {
      setShowCTA(true);
    }, 3000); // Show CTA after circle forms

    return () => {
      clearTimeout(ctaTimer);
    };
  }, []);

  return (
    <>
      <Header />
      <main
        id="main-content"
        className="relative"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        {/* Hero Section with IntroAnimation */}
        <div className="absolute inset-0 w-full h-full">
          <IntroAnimation />
        </div>

        {/* CTA Section - Shows after circle animation */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: showCTA ? 1 : 0,
            y: showCTA ? 0 : 20,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* No container/card - just the text elements */}
          <h2
            className="text-3xl md:text-5xl tracking-tight text-center mb-5 max-w-md"
            style={{
              color: 'var(--color-text-primary)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Share your photos <span style={{ fontStyle: 'italic', fontWeight: 500 }}>securely</span>
          </h2>
          <p
            className="text-lg md:text-xl text-center max-w-lg mb-10"
            style={{
              color: 'var(--color-text-secondary)',
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Experience seamless, <strong style={{ fontWeight: 600 }}>end-to-end encrypted</strong> transfers that automatically vanish after download.
          </p>

          {/* CTA Button - proper width, not full */}
          <Link href="/upload" className="pointer-events-auto">
            <motion.button
              className="flex items-center justify-center gap-3 px-10 py-4 rounded-full text-white text-lg transition-all duration-300"
              style={{
                backgroundColor: 'var(--color-interactive)',
                boxShadow: '0 4px 24px rgba(0, 122, 255, 0.25)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 8px 32px rgba(0, 122, 255, 0.35)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              Share images now
              <FiArrowRight className="h-5 w-5" />
            </motion.button>
          </Link>
        </motion.div>
      </main>
    </>
  );
}
