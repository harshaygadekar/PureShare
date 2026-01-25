/**
 * How It Works Component
 * Apple-style 3-step process with numbered indicators
 * Clean horizontal timeline layout
 */

'use client';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { FiUpload, FiLink, FiShare2 } from 'react-icons/fi';
import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    icon: FiUpload,
    title: 'Upload Your Files',
    description: 'Drag and drop files or click to browse. Support for multiple files and large file sizes up to 5GB.',
  },
  {
    number: '02',
    icon: FiLink,
    title: 'Get Your Link',
    description: 'Instantly receive a secure, shareable link. Optionally add password protection and set expiration.',
  },
  {
    number: '03',
    icon: FiShare2,
    title: 'Share Securely',
    description: 'Send the link to anyone. Recipients can download files without creating an account.',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function HowItWorks() {
  return (
    <Section id="how-it-works" className="section-padding bg-[var(--color-bg-secondary)]">
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
            How it works
          </h2>
          <p
            className="mx-auto max-w-2xl"
            style={{
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Share files in three simple steps. No complicated setup or configuration required.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="relative grid gap-12 md:grid-cols-3">
          {/* Connector Line (Desktop) */}
          <div
            className="absolute left-0 right-0 top-12 hidden h-px md:block"
            style={{ backgroundColor: 'var(--color-border)' }}
          />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="relative text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: index * 0.15, duration: 0.5 }}
            >
              {/* Step Number */}
              <div
                className="relative z-10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  border: '2px solid var(--color-border)',
                }}
              >
                <span
                  className="text-3xl font-bold"
                  style={{ color: 'var(--color-interactive)' }}
                >
                  {step.number}
                </span>
              </div>

              {/* Icon */}
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'var(--color-bg-primary)' }}
              >
                <step.icon
                  className="h-7 w-7"
                  style={{ color: 'var(--color-interactive)' }}
                />
              </div>

              {/* Content */}
              <h3
                className="mb-3 text-xl font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {step.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
