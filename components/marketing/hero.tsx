/**
 * Hero Section
 * Large headline, subheadline, and CTA
 * Apple-inspired minimal design
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { FiArrowRight, FiLock, FiZap } from 'react-icons/fi';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-24 sm:py-32 lg:py-40">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 border border-border px-4 py-2 text-sm text-secondary">
            <FiZap className="h-4 w-4 text-accent" />
            <span>Secure. Fast. Simple.</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-6xl font-bold tracking-tight text-foreground sm:text-7xl lg:text-[72px]">
            Share files securely
            <br />
            <span className="text-accent">without the hassle</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-secondary sm:text-xl">
            Upload, share, and track your files with military-grade encryption.
            No signup required. Links expire automatically. Your privacy is guaranteed.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/upload">
                Start Sharing
                <FiArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <Link href="#features">
                See How It Works
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-tertiary">
            <div className="flex items-center gap-2">
              <FiLock className="h-4 w-4" />
              <span>End-to-end encrypted</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span>No data storage</span>
            <div className="h-4 w-px bg-border" />
            <span>Auto-expiring links</span>
          </div>
        </div>
      </Container>

      {/* Background gradient effect */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-accent/5 blur-[120px]" />
      </div>
    </section>
  );
}
