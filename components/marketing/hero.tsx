/**
 * Hero Section
 * Apple-inspired flat design with clean typography
 * Product-centric approach with single focused CTA
 */

'use client';

import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Simplified animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden"
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: 'var(--space-3xl)',
        paddingBottom: 'var(--space-3xl)',
      }}
    >
      {/* Subtle gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%)',
        }}
      />

      <Container>
        <motion.div
          className="mx-auto max-w-4xl text-center"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: 'var(--color-success)' }}
              />
              Secure file sharing made simple
            </span>
          </motion.div>

          {/* Headline - Apple Typography */}
          <motion.h1
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-hero mb-6"
            style={{
              color: 'var(--color-text-primary)',
            }}
          >
            Share files securely.
            <br />
            <span style={{ color: 'var(--color-interactive)' }}>
              No hassle.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-10 max-w-2xl text-body-lg"
            style={{
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            Upload, share, and track your files with end-to-end encryption.
            No signup required. Links expire automatically.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/upload"
              className="btn-primary group inline-flex items-center gap-2 rounded-full px-8 py-3 text-base"
            >
              Start Sharing
              <FiArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#features"
              className="btn-secondary inline-flex items-center rounded-full px-8 py-3 text-base"
            >
              Learn More
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8"
          >
            {[
              'End-to-end encrypted',
              'Zero knowledge',
              'Auto-expiring links',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                <svg
                  className="h-4 w-4"
                  style={{ color: 'var(--color-success)' }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{item}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
