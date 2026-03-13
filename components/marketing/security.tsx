/**
 * Security Highlights Component
 * Apple-style security showcase with trust indicators
 */

'use client';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { FiShield, FiLock, FiEyeOff, FiClock, FiServer, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const securityFeatures = [
  {
    icon: FiShield,
    title: 'Signed Access',
    description: 'Files are served through time-limited signed URLs instead of permanent public links.',
  },
  {
    icon: FiEyeOff,
    title: 'Optional Passwords',
    description: 'Protect sensitive shares with an extra password step before recipients can access files.',
  },
  {
    icon: FiClock,
    title: 'Expiring Links',
    description: 'Share access stops when the chosen link lifetime ends, with cleanup following afterward.',
  },
  {
    icon: FiServer,
    title: 'Secure Infrastructure',
    description: 'Uploads and downloads run on managed cloud storage and authenticated application APIs.',
  },
];

const trustIndicators = [
  { icon: FiCheckCircle, text: 'TLS in transit' },
  { icon: FiCheckCircle, text: 'Signed storage URLs' },
  { icon: FiCheckCircle, text: 'Optional passwords' },
  { icon: FiCheckCircle, text: 'Expiring links' },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Security() {
  return (
    <Section id="security" className="section-padding">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column - Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            {/* Icon */}
            <div
              className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-xl"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
              }}
            >
              <FiLock
                className="h-7 w-7"
                style={{ color: 'var(--color-interactive)' }}
              />
            </div>

            <h2
              className="mb-4"
              style={{
                fontSize: 'var(--text-h2)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
              }}
            >
              Security you can trust
            </h2>
            <p
              className="mb-8"
              style={{
                fontSize: 'var(--text-body-lg)',
                lineHeight: 'var(--leading-relaxed)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Your privacy and security are our top priorities. We&apos;ve built PureShare
              around practical controls that help limit who can access shared files and for how long.
            </p>

            {/* Trust indicators */}
            <div className="grid grid-cols-2 gap-4">
              {trustIndicators.map((indicator) => (
                <div key={indicator.text} className="flex items-center gap-2">
                  <indicator.icon
                    className="h-5 w-5"
                    style={{ color: 'var(--color-success)' }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {indicator.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right column - Security features */}
          <div className="space-y-4">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="card-apple p-6"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                  >
                    <feature.icon
                      className="h-5 w-5"
                      style={{ color: 'var(--color-interactive)' }}
                    />
                  </div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {feature.title}
                  </h3>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
