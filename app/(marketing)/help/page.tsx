/**
 * Help Page
 * Self-service support with searchable FAQs
 */

import Link from 'next/link';
import { ChevronDown, Search, MessageCircle, Mail } from 'lucide-react';
import { FILE_CONFIG, SHARE_CONFIG } from '@/config/constants';

const maxImageMb = Math.round(FILE_CONFIG.maxImageFileSize / 1024 / 1024);
const maxVideoMb = Math.round(FILE_CONFIG.maxVideoFileSize / 1024 / 1024);
const maxExpirationDays = Math.max(...SHARE_CONFIG.standardExpirationOptionsHours) / 24;

const faqCategories = [
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'How does PureShare work?',
        answer: 'PureShare lets you upload supported files and share them with a temporary link. Links expire on the schedule you choose, and recipients do not need an account to download.',
      },
      {
        question: 'Is there a file size limit?',
        answer: `Yes. Current limits support image files up to ${maxImageMb}MB and supported video files up to ${maxVideoMb}MB per file.`,
      },
      {
        question: 'How long do files stay available?',
        answer: `You can choose from the currently available expiration options, up to ${maxExpirationDays} days. Once a link expires, downloads stop working and cleanup runs afterward.`,
      },
      {
        question: 'Do I need an account?',
        answer: 'Recipients do not need an account. You can also create shares anonymously, while signed-in users get dashboard and analytics features.',
      },
    ],
  },
  {
    category: 'File Sharing',
    questions: [
      {
        question: 'How do I share a file?',
        answer: 'Upload your file, choose an expiration time, optionally add a password, then copy the share link. Recipients can download without creating an account.',
      },
      {
        question: 'Can I password protect shares?',
        answer: 'Yes! When creating a share, you can optionally set a password. Recipients will need to enter the password before they can download the file.',
      },
      {
        question: 'How do download limits work?',
        answer: 'PureShare currently expires links by time rather than by a download cap. Owners can still review download activity for shares linked to their account.',
      },
      {
        question: 'Can I delete a share before it expires?',
        answer: 'Yes for signed-in owners. Shares connected to your dashboard can be deleted manually before they expire.',
      },
    ],
  },
  {
    category: 'Privacy & Security',
    questions: [
      {
        question: 'Are files encrypted?',
        answer: 'Traffic to PureShare uses TLS in transit, and file access is gated with signed URLs plus optional password protection on supported shares.',
      },
      {
        question: 'What happens to files after expiry?',
        answer: 'Once a share expires, the link stops working immediately. File cleanup happens afterward and expired shares should be treated as unavailable.',
      },
      {
        question: 'Do you store any personal data?',
        answer: 'Recipients do not need an account, but signed-in users can create dashboard-managed shares. We also store operational and share analytics data needed to run the service and show owners activity on their links.',
      },
    ],
  },
  {
    category: 'Troubleshooting',
    questions: [
      {
        question: 'Share link not working',
        answer: 'The link may have expired, been deleted by the owner, or require a password before access. Verify the URL and any password shared with you.',
      },
      {
        question: 'File upload failed',
        answer: `Check that your file matches the supported image or video limits (${maxImageMb}MB images, ${maxVideoMb}MB video) and try again. If the problem persists, contact support with the file type and size.`,
      },
      {
        question: 'Page not loading',
        answer: 'Try clearing your browser cache or using a different browser. Make sure JavaScript is enabled. If the issue continues, check our status page or contact support.',
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="py-20 bg-bg-secondary">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-h1 font-bold text-primary tracking-tight">
            How can we help?
          </h1>
          <p className="mt-4 text-lg text-secondary">
            Find answers to common questions about PureShare
          </p>
          
          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
            <input
              type="text"
              placeholder="Search for answers..."
              className="w-full pl-12 pr-4 py-4 bg-bg-primary border border-border rounded-xl text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-interactive focus:border-transparent transition-all"
            />
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          {faqCategories.map((category) => (
            <div key={category.category} className="mb-12">
              <h2 className="text-h3 font-semibold text-primary mb-6">
                {category.category}
              </h2>
              <div className="space-y-3">
                {category.questions.map((faq, index) => (
                  <details
                    key={index}
                    className="group bg-bg-secondary border border-border rounded-lg overflow-hidden"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-bg-elevated transition-colors">
                      <span className="font-medium text-primary pr-4">
                        {faq.question}
                      </span>
                      <ChevronDown className="w-5 h-5 text-tertiary group-open:rotate-180 transition-transform flex-shrink-0" />
                    </summary>
                    <div className="px-4 pb-4 text-secondary leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still Need Help CTA */}
      <section className="py-16 bg-bg-secondary">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-h3 font-semibold text-primary mb-4">
            Still need help?
          </h2>
          <p className="text-secondary mb-8">
            Couldn&apos;t find what you&apos;re looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-interactive text-white font-semibold rounded-lg hover:bg-interactive-hover transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </Link>
            <a
              href="mailto:support@pureshare.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-primary font-semibold rounded-lg hover:bg-bg-elevated transition-colors"
            >
              <Mail className="w-5 h-5" />
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
