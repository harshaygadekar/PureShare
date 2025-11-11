/**
 * Features Grid Component
 * 3x2 grid showcasing key features
 * Icon + Title + Description
 */

'use client';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { FiLock, FiZap, FiClock, FiShield, FiLink, FiEye } from 'react-icons/fi';

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

export function Features() {
  return (
    <Section id="features" className="bg-surface">
      <Container>
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Everything you need
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-secondary">
            Built with security and simplicity in mind. Share files without compromising on privacy or convenience.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative border border-border bg-background p-8 transition-all duration-250 hover:border-border-hover"
            >
              {/* Icon */}
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center bg-elevated">
                <feature.icon className="h-6 w-6 text-accent transition-transform duration-250 group-hover:scale-110" />
              </div>

              {/* Content */}
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
