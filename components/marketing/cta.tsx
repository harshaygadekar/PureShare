/**
 * Call-to-Action Component
 * Apple-style single-focus CTA section
 */

'use client';

import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function CTA() {
  return (
    <Section className="section-padding">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl p-12 sm:p-16 lg:p-20"
          style={{
            backgroundColor: 'var(--color-text-primary)',
          }}
        >
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            {/* Headline */}
            <h2
              className="mb-6"
              style={{
                fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: 'var(--font-bold)',
                lineHeight: 'var(--leading-tight)',
                color: 'var(--color-bg-primary)',
              }}
            >
              Ready to share files securely?
            </h2>

            {/* Subtext */}
            <p
              className="mb-10"
              style={{
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-text-tertiary)',
              }}
            >
              Start sharing in seconds. No signup required.
            </p>

            {/* Single CTA Button */}
            <Link
              href="/upload"
              className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold transition-all"
              style={{
                backgroundColor: 'var(--color-interactive)',
                color: '#FFFFFF',
              }}
            >
              Get Started for Free
              <FiArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Fine Print */}
            <p
              className="mt-8 text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              No credit card • Free forever • Unlimited shares
            </p>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
