/**
 * Contact Page
 * Guest-friendly contact form for support
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send, Mail, MessageCircle, Github, CheckCircle, AlertCircle } from 'lucide-react';

const subjectOptions = [
  { value: 'general', label: 'General Question' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'other', label: 'Other' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.message) {
      setError('Email and message are required');
      return;
    }

    // For MVP, just show success
    setSubmitted(true);
    setError('');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success-bg rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-h2 font-bold text-primary mb-4">
            Message Sent!
          </h1>
          <p className="text-secondary mb-8">
            Thanks for reaching out! We typically reply within 24 hours.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-interactive text-white font-semibold rounded-lg hover:bg-interactive-hover transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="py-20 bg-bg-secondary">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-h1 font-bold text-primary tracking-tight">
            Get in touch
          </h1>
          <p className="mt-4 text-lg text-secondary">
            Have a question? We&apos;d love to hear from you. We typically reply within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16">
        <div className="mx-auto max-w-xl px-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
                Name <span className="text-tertiary">(optional)</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-bg-primary border border-border rounded-lg text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-interactive focus:border-transparent transition-all"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                Email <span className="text-error">*</span>
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-bg-primary border border-border rounded-lg text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-interactive focus:border-transparent transition-all"
              />
            </div>

            {/* Subject Dropdown */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-primary mb-2">
                Subject
              </label>
              <select
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 bg-bg-primary border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-interactive focus:border-transparent transition-all"
              >
                {subjectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-primary mb-2">
                Message <span className="text-error">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can we help you?"
                className="w-full px-4 py-3 bg-bg-primary border border-border rounded-lg text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-interactive focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-error text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-interactive text-white font-semibold rounded-lg hover:bg-interactive-hover transition-colors"
            >
              <Send className="w-5 h-5" />
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Alternative Contact Methods */}
      <section className="py-16 bg-bg-secondary">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-h4 font-semibold text-primary mb-6">
            Other ways to reach us
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <a
              href="mailto:support@pureshare.com"
              className="flex flex-col items-center p-6 bg-bg-primary border border-border rounded-xl hover:border-interactive transition-colors"
            >
              <Mail className="w-8 h-8 text-interactive mb-3" />
              <span className="font-medium text-primary">Email</span>
              <span className="text-sm text-secondary mt-1">support@pureshare.com</span>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-bg-primary border border-border rounded-xl hover:border-interactive transition-colors"
            >
              <Github className="w-8 h-8 text-interactive mb-3" />
              <span className="font-medium text-primary">GitHub</span>
              <span className="text-sm text-secondary mt-1">Report bugs</span>
            </a>
            <Link
              href="/help"
              className="flex flex-col items-center p-6 bg-bg-primary border border-border rounded-xl hover:border-interactive transition-colors"
            >
              <MessageCircle className="w-8 h-8 text-interactive mb-3" />
              <span className="font-medium text-primary">Help Center</span>
              <span className="text-sm text-secondary mt-1">Browse FAQs</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
