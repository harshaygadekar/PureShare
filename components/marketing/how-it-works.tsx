/**
 * How It Works Component
 * 3-step process showing how to use the platform
 */

'use client';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { FiUpload, FiLink, FiShare2 } from 'react-icons/fi';

const steps = [
  {
    number: '01',
    icon: FiUpload,
    title: 'Upload Your Files',
    description: 'Drag and drop files or click to browse. Support for multiple files and large file sizes up to 5GB per file.',
  },
  {
    number: '02',
    icon: FiLink,
    title: 'Get Your Link',
    description: 'Instantly receive a secure, shareable link. Optionally add password protection and set custom expiration times.',
  },
  {
    number: '03',
    icon: FiShare2,
    title: 'Share Securely',
    description: 'Send the link to anyone. Recipients can download files without creating an account. Track access in real-time.',
  },
];

export function HowItWorks() {
  return (
    <Section className="bg-background">
      <Container>
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            How it works
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-secondary">
            Share files in three simple steps. No complicated setup or configuration required.
          </p>
        </div>

        <div className="relative grid gap-12 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative text-center">
              {/* Connector line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-12 hidden h-px w-full bg-border md:block" />
              )}

              {/* Step number */}
              <div className="relative z-10 mx-auto mb-6 flex h-24 w-24 items-center justify-center border border-border bg-background">
                <span className="text-3xl font-bold text-accent">{step.number}</span>
              </div>

              {/* Icon */}
              <div className="mb-4 flex justify-center">
                <div className="inline-flex h-16 w-16 items-center justify-center bg-elevated">
                  <step.icon className="h-8 w-8 text-accent" />
                </div>
              </div>

              {/* Content */}
              <h3 className="mb-3 text-2xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-secondary">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
