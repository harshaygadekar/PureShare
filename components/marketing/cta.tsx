/**
 * Call-to-Action Component
 * Final CTA section to drive conversions
 */

'use client';

import Link from 'next/link';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { FiArrowRight } from 'react-icons/fi';

export function CTA() {
  return (
    <Section className="bg-background">
      <Container>
        <div className="relative overflow-hidden border border-border bg-elevated p-12 sm:p-16 lg:p-20">
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Ready to share files securely?
            </h2>
            <p className="mb-10 text-lg text-secondary sm:text-xl">
              Join thousands of users who trust PureShare for their file sharing needs.
              Start sharing in seconds, no credit card required.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <LiquidButton asChild size="lg" className="h-12 px-8 text-base">
                <Link href="/upload">
                  Get Started for Free
                  <FiArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </LiquidButton>
              <LiquidButton asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                <Link href="/signup">
                  Create Account
                </Link>
              </LiquidButton>
            </div>

            <p className="mt-8 text-sm text-tertiary">
              No signup required to share files • Free forever • Unlimited shares
            </p>
          </div>

          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
            <div className="h-[400px] w-[400px] rounded-full bg-accent/20 blur-[100px]" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
