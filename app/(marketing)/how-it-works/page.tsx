/**
 * How It Works Page
 * Guide users through the sharing workflow
 */

"use client";

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { FiUpload, FiLink, FiShare2, FiArrowRight, FiHelpCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { FILE_CONFIG, SHARE_CONFIG } from '@/config/constants';

const maxImageMb = Math.round(FILE_CONFIG.maxImageFileSize / 1024 / 1024);
const maxVideoMb = Math.round(FILE_CONFIG.maxVideoFileSize / 1024 / 1024);
const maxExpirationDays = Math.max(...SHARE_CONFIG.standardExpirationOptionsHours) / 24;

const steps = [
  {
    number: '01',
    icon: FiUpload,
    title: 'Upload Your Files',
    description: `Drag and drop files or click to browse. Current support includes images up to ${maxImageMb}MB and videos up to ${maxVideoMb}MB.`,
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

const faqs = [
  {
    question: 'How long do files stay available?',
    answer: `You can choose from the available expiration options, currently up to ${maxExpirationDays} days. After that, the link stops working and cleanup follows.`,
  },
  {
    question: 'What file types are supported?',
    answer: 'PureShare currently supports configured image formats and common web video formats.',
  },
  {
    question: 'Is there a file size limit?',
    answer: `Per-file limits currently allow images up to ${maxImageMb}MB and videos up to ${maxVideoMb}MB, with up to 50 files per share.`,
  },
  {
    question: 'Do recipients need an account?',
    answer: 'No. Recipients can download files directly using the share link without any account.',
  },
  {
    question: 'How secure is my data?',
    answer: 'PureShare uses TLS in transit, signed storage URLs, and optional password protection to reduce exposure.',
  },
  {
    question: 'Can I track who downloaded my files?',
    answer: 'Yes, you can view analytics showing download counts and timestamps in your dashboard.',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  return (
    <motion.div
      className="text-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      transition={{ delay: index * 0.15, duration: 0.4 }}
    >
      <div className="relative z-10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-200 bg-white">
        <span className="text-2xl font-bold text-blue-600">{step.number}</span>
      </div>
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
        <step.icon className="h-6 w-6 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
    </motion.div>
  );
}

function FAQItem({ item, index }: { item: typeof faqs[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="border border-gray-200 rounded-lg overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{item.question}</span>
        <FiHelpCircle className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-600">{item.answer}</p>
        </div>
      )}
    </motion.div>
  );
}

export default function HowItWorksPage() {
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
              How It Works
            </h1>
            <p className="text-lg text-gray-600">
              Share files in three simple steps.
            </p>
          </motion.div>
        </Container>
      </Section>

      {/* Steps Section */}
      <Section className="py-12">
        <Container>
          <div className="relative grid gap-10 md:grid-cols-3">
            {/* Connector Line */}
            <div className="absolute left-0 right-0 top-10 hidden h-px md:block bg-gray-200" />
            {steps.map((step, index) => (
              <StepCard key={step.number} step={step} index={index} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Detailed Steps */}
      <Section className="py-12 bg-gray-50">
        <Container>
          <div className="max-w-3xl mx-auto space-y-8">
            <motion.div
              className="flex gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Upload Files</h3>
                <p className="text-sm text-gray-600">Simply drag and drop your files onto the upload area, or click to browse your computer. You can select multiple files at once.</p>
              </div>
            </motion.div>
            <motion.div
              className="flex gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Customize Options</h3>
                <p className="text-sm text-gray-600">Set an optional password for extra security, and choose when your link expires. You can also add a title to organize your shares.</p>
              </div>
            </motion.div>
            <motion.div
              className="flex gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Share the Link</h3>
                <p className="text-sm text-gray-600">Copy your secure link and share it via email, message, or any platform. Recipients click the link to view and download files.</p>
              </div>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* FAQ Section */}
      <Section className="py-12">
        <Container>
          <motion.div
            className="text-center mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">Common questions about sharing files</p>
          </motion.div>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem key={faq.question} item={faq} index={index} />
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
              Get Started Now
            </h2>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto">
              Try it yourself. Share your first file in seconds.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Upload Files
              <FiArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </Container>
      </Section>
    </>
  );
}
