/**
 * Features Page
 * Showcase product capabilities
 */

"use client";

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { FiLock, FiZap, FiClock, FiShield, FiLink, FiEye, FiDownload, FiImage, FiSmartphone, FiCloud } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

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

const additionalFeatures = [
  {
    icon: FiImage,
    title: 'Image Previews',
    description: 'View images directly in the browser before downloading.',
  },
  {
    icon: FiDownload,
    title: 'Bulk Downloads',
    description: 'Download all files as a single ZIP archive.',
  },
  {
    icon: FiSmartphone,
    title: 'Mobile Friendly',
    description: 'Works seamlessly on any device, anywhere.',
  },
  {
    icon: FiCloud,
    title: 'Cloud Storage',
    description: 'Files stored securely in AWS S3 with redundancy.',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={fadeInUp}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group p-6 border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-300"
    >
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors mb-4">
        <feature.icon className="h-6 w-6 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {feature.title}
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  );
}

export default function FeaturesPage() {
  return (
    <>
      {/* Hero Section */}
      <Section className="pt-20 pb-12">
        <Container>
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Features
            </h1>
            <p className="text-lg text-gray-600">
              Everything you need to share files securely and effortlessly.
            </p>
          </motion.div>
        </Container>
      </Section>

      {/* Main Features Grid */}
      <Section className="py-12">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Additional Features */}
      <Section className="py-12 bg-gray-50">
        <Container>
          <motion.div
            className="text-center mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              More Features
            </h2>
            <p className="text-gray-600">Additional capabilities for better sharing</p>
          </motion.div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {additionalFeatures.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-12">
        <Container>
          <motion.div
            className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to share securely?
            </h2>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto">
              Start sharing your files in seconds. No account required.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Sharing
              <FiArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </Container>
      </Section>
    </>
  );
}
