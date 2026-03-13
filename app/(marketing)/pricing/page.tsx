/**
 * Pricing Page
 * Simple, transparent pricing - it's free!
 */

import Link from 'next/link';
import { Check, Zap, Shield } from 'lucide-react';
import { FILE_CONFIG, SHARE_CONFIG } from '@/config/constants';

const maxImageMb = Math.round(FILE_CONFIG.maxImageFileSize / 1024 / 1024);
const maxVideoMb = Math.round(FILE_CONFIG.maxVideoFileSize / 1024 / 1024);
const maxExpirationDays = Math.max(...SHARE_CONFIG.standardExpirationOptionsHours) / 24;

const features = [
  { name: 'Image uploads', free: `Up to ${maxImageMb}MB`, pro: 'Larger limits planned' },
  { name: 'Video uploads', free: `Up to ${maxVideoMb}MB`, pro: 'Larger limits planned' },
  { name: 'Expiration', free: `Up to ${maxExpirationDays} days`, pro: 'Custom policies planned' },
  { name: 'Password protection', free: true, pro: true },
  { name: 'No account required', free: true, pro: true },
  { name: 'Owner analytics', free: true, pro: true },
  { name: 'Bulk ZIP download', free: true, pro: true },
  { name: 'Priority support', free: false, pro: true },
  { name: 'Custom branding', free: false, pro: true },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="py-20 bg-bg-secondary">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-h1 font-bold text-primary tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-secondary max-w-2xl mx-auto">
            PureShare is free to use today, with media-type upload limits and expiring links built in.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="p-8 bg-bg-secondary border border-border rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-interactive/10 rounded-lg">
                  <Zap className="w-6 h-6 text-interactive" />
                </div>
                <h2 className="text-h3 font-semibold text-primary">Free</h2>
              </div>
              <div className="mb-6">
                <span className="text-hero font-bold text-primary">$0</span>
                <span className="text-secondary"> / forever</span>
              </div>
              <p className="text-secondary mb-6">
                Share images and video with expiring links, optional passwords, and owner analytics.
              </p>
              <Link
                href="/"
                className="block w-full py-3 text-center bg-interactive text-white font-semibold rounded-lg hover:bg-interactive-hover transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan (Coming Soon) */}
            <div className="p-8 bg-bg-elevated border border-border rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-interactive text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                Coming Soon
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-h3 font-semibold text-primary">Pro</h2>
              </div>
              <div className="mb-6">
                <span className="text-hero font-bold text-primary">$9</span>
                <span className="text-secondary"> / month</span>
              </div>
              <p className="text-secondary mb-6">
                Planned for teams and power users who need larger limits and workflow controls.
              </p>
              <div className="w-full py-3 text-center border border-border text-tertiary font-semibold rounded-lg cursor-not-allowed">
                Coming Soon
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-bg-secondary">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-h3 font-semibold text-primary text-center mb-12">
            What you get
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 pr-4 text-primary font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 text-primary font-semibold">Free</th>
                  <th className="text-center py-4 pl-4 text-primary font-semibold">Pro</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-4 pr-4 text-secondary">{feature.name}</td>
                    <td className="text-center py-4 px-4">
                      {typeof feature.free === 'boolean' ? (
                        feature.free ? (
                          <Check className="w-5 h-5 text-success mx-auto" />
                        ) : (
                          <span className="text-tertiary">—</span>
                        )
                      ) : (
                        <span className="text-secondary">{feature.free}</span>
                      )}
                    </td>
                    <td className="text-center py-4 pl-4">
                      {typeof feature.pro === 'boolean' ? (
                        feature.pro ? (
                          <Check className="w-5 h-5 text-success mx-auto" />
                        ) : (
                          <span className="text-tertiary">—</span>
                        )
                      ) : (
                        <span className="text-secondary">{feature.pro}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-h3 font-semibold text-primary mb-4">
            Questions?
          </h2>
          <p className="text-secondary mb-6">
            Check out our Help Center for answers to common questions.
          </p>
          <Link
            href="/help"
            className="inline-flex items-center justify-center px-6 py-3 border border-border text-primary font-semibold rounded-lg hover:bg-bg-secondary transition-colors"
          >
            Visit Help Center
          </Link>
        </div>
      </section>
    </div>
  );
}
