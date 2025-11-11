/**
 * Security Highlights Component
 * Showcasing security features and trust indicators
 */

'use client';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { FiShield, FiLock, FiEyeOff, FiClock, FiServer, FiCheckCircle } from 'react-icons/fi';

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
    description: 'Files are permanently deleted from our servers when links expire. No traces left behind.',
  },
  {
    icon: FiServer,
    title: 'Secure Infrastructure',
    description: 'Hosted on enterprise-grade cloud infrastructure with 99.9% uptime guarantee.',
  },
];

const trustIndicators = [
  { icon: FiCheckCircle, text: 'GDPR Compliant' },
  { icon: FiCheckCircle, text: 'SOC 2 Certified' },
  { icon: FiCheckCircle, text: 'ISO 27001' },
  { icon: FiCheckCircle, text: 'Regular Security Audits' },
];

export function Security() {
  return (
    <Section className="bg-surface">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column - Content */}
          <div>
            <div className="mb-8 inline-flex h-16 w-16 items-center justify-center border border-accent bg-background">
              <FiLock className="h-8 w-8 text-accent" />
            </div>

            <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Security you can trust
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-secondary">
              Your privacy and security are our top priorities. We've built PureShare
              with enterprise-grade security features to ensure your files stay private
              and protected.
            </p>

            {/* Trust indicators */}
            <div className="grid grid-cols-2 gap-4">
              {trustIndicators.map((indicator) => (
                <div key={indicator.text} className="flex items-center gap-2">
                  <indicator.icon className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium text-foreground">
                    {indicator.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Security features */}
          <div className="space-y-6">
            {securityFeatures.map((feature) => (
              <div
                key={feature.title}
                className="border border-border bg-background p-6 transition-all duration-250 hover:border-border-hover"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-elevated">
                    <feature.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
