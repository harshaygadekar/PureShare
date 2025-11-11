/**
 * Stats Display Component
 * Showcasing key metrics and usage statistics
 */

'use client';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';

const stats = [
  {
    value: '10M+',
    label: 'Files Shared',
    description: 'Securely transferred by users worldwide',
  },
  {
    value: '50K+',
    label: 'Active Users',
    description: 'Trust PureShare for their file sharing',
  },
  {
    value: '99.9%',
    label: 'Uptime',
    description: 'Reliable service you can count on',
  },
  {
    value: '5GB',
    label: 'Max File Size',
    description: 'Share large files without limits',
  },
];

export function Stats() {
  return (
    <Section className="bg-elevated">
      <Container>
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Trusted by thousands
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-secondary">
            Join a growing community of users who rely on PureShare for secure file sharing.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border border-border bg-background p-8 text-center transition-all duration-250 hover:border-border-hover"
            >
              <div className="mb-2 text-5xl font-bold text-accent">
                {stat.value}
              </div>
              <div className="mb-2 text-lg font-semibold text-foreground">
                {stat.label}
              </div>
              <div className="text-sm text-secondary">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
