/**
 * Landing Page
 * Main marketing page with hero, features, and CTA sections
 * Apple-inspired minimal design
 */

import { Hero } from '@/components/marketing/hero';
import { Features } from '@/components/marketing/features';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { Security } from '@/components/marketing/security';
import { Stats } from '@/components/marketing/stats';
import { CTA } from '@/components/marketing/cta';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Security />
      <Stats />
      <CTA />
    </>
  );
}
