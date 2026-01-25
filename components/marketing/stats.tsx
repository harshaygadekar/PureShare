/**
 * Stats Display Component
 * Apple-style large numbers with supporting text
 */

'use client';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { motion } from 'framer-motion';

const stats = [
  {
    value: '10M+',
    label: 'Files Shared',
    description: 'Securely transferred worldwide',
  },
  {
    value: '50K+',
    label: 'Active Users',
    description: 'Trust PureShare daily',
  },
  {
    value: '99.9%',
    label: 'Uptime',
    description: 'Reliable service guarantee',
  },
  {
    value: '5GB',
    label: 'Max File Size',
    description: 'Share large files easily',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Stats() {
  return (
    <Section
      id="stats"
      className="section-padding bg-[var(--color-bg-secondary)]"
    >
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
            Trusted by thousands
          </h2>
          <p
            className="mx-auto max-w-2xl"
            style={{
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Join a growing community of users who rely on PureShare for secure file sharing.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-center"
            >
              {/* Large Number */}
              <div
                className="mb-2"
                style={{
                  fontSize: 'var(--text-h1)',
                  fontWeight: 'var(--font-bold)',
                  color: 'var(--color-interactive)',
                }}
              >
                {stat.value}
              </div>
              {/* Label */}
              <div
                className="mb-1 text-lg font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {stat.label}
              </div>
              {/* Description */}
              <div
                className="text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
