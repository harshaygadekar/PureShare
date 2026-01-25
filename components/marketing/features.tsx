/**
 * Features Grid Component
 * Apple-style flat cards with subtle hover effects
 * Clean, minimal design without 3D effects
 */

'use client';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { FiLock, FiZap, FiClock, FiShield, FiLink, FiEye } from 'react-icons/fi';
import { motion } from 'framer-motion';

const features = [
  {
    icon: FiLock,
    title: 'End-to-End Encryption',
    description: 'Your files are encrypted before upload. Only recipients with the link can access them.',
  },
  {
    icon: FiZap,
    title: 'Lightning Fast',
    description: 'Optimized infrastructure ensures rapid uploads and downloads, no matter the file size.',
  },
  {
    icon: FiClock,
    title: 'Auto-Expiring Links',
    description: 'Set custom expiration times. Links automatically become invalid after the time period.',
  },
  {
    icon: FiShield,
    title: 'Password Protection',
    description: 'Add an extra layer of security with optional password protection for sensitive files.',
  },
  {
    icon: FiLink,
    title: 'Simple Sharing',
    description: 'Generate a shareable link instantly. No accounts, no complexity, just share and go.',
  },
  {
    icon: FiEye,
    title: 'Track Analytics',
    description: 'Monitor who accessed your files, when, and from where with detailed analytics.',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={fadeInUp}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="card-apple group p-8"
    >
      {/* Icon */}
      <div
        className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
        }}
      >
        <feature.icon
          className="h-6 w-6"
          style={{ color: 'var(--color-interactive)' }}
        />
      </div>

      {/* Title */}
      <h3
        className="mb-3 text-xl font-semibold"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {feature.title}
      </h3>

      {/* Description */}
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {feature.description}
      </p>
    </motion.div>
  );
}

export function Features() {
  return (
    <Section id="features" className="section-padding">
      <Container>
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="mb-4"
            style={{
              fontSize: 'var(--text-h2)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
            }}
          >
            Everything you need
          </h2>
          <p
            className="mx-auto max-w-2xl"
            style={{
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Built with security and simplicity in mind. Share files without compromising on privacy or convenience.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
