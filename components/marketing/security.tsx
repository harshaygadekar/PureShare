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
    title: 'Military-Grade Encryption',
    description: 'AES-256 encryption ensures your files are protected during transit and at rest.',
  },
  {
    icon: FiEyeOff,
    title: 'Zero-Knowledge Architecture',
    description: 'We never see your files. All encryption happens client-side before upload.',
  },
  {
    icon: FiClock,
    title: 'Automatic Deletion',
    description: 'Files are permanently deleted from our servers when links expire.',
  },
  {
    icon: FiServer,
    title: 'Secure Infrastructure',
    description: 'Hosted on enterprise-grade cloud infrastructure with 99.9% uptime.',
  },
];

const trustIndicators = [
  { icon: FiCheckCircle, text: 'GDPR Compliant' },
  { icon: FiCheckCircle, text: 'SOC 2 Certified' },
  { icon: FiCheckCircle, text: 'ISO 27001' },
  { icon: FiCheckCircle, text: 'Regular Security Audits' },
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
              Your privacy and security are our top priorities. We've built PureShare
              with enterprise-grade security features to ensure your files stay protected.
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
