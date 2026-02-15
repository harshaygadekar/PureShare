/**
 * Help Page
 * Self-service support with searchable FAQs
 */

import Link from 'next/link';
import { ChevronDown, Search, MessageCircle, Mail } from 'lucide-react';

const faqCategories = [
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'How does PureShare work?',
        answer: 'PureShare lets you upload files and share them with a temporary link. The file is automatically deleted after the expiration time you choose. No account required - just upload, share, and forget.',
      },
      {
        question: 'Is there a file size limit?',
        answer: 'Yes, the maximum file size is 10GB per upload. This ensures fast uploads and reliable sharing for most common file types.',
      },
      {
        question: 'How long do files stay available?',
        answer: 'You can choose an expiration time from 1 hour to 7 days. After the expiration time passes, the file is automatically and permanently deleted.',
      },
      {
        question: 'Do I need an account?',
        answer: 'No account is required! Simply upload your file, set an expiration time, and share the link. No registration, no tracking.',
      },
    ],
  },
  {
    category: 'File Sharing',
    questions: [
      {
        question: 'How do I share a file?',
        answer: 'Upload your file on our homepage, choose an expiration time and download limit, then copy the unique share link. Send it to anyone - they can download the file without needing an account.',
      },
      {
        question: 'Can I password protect shares?',
        answer: 'Yes! When creating a share, you can optionally set a password. Recipients will need to enter the password before they can download the file.',
      },
      {
        question: 'How do download limits work?',
        answer: 'You can set a maximum number of downloads (1-100) for each share. Once that limit is reached, the share becomes invalid even if the expiration time hasn\'t passed.',
      },
      {
        question: 'Can I delete a share before it expires?',
        answer: 'Currently, shares are automatically deleted after expiration or when the download limit is reached. Manual early deletion is not available in this version.',
      },
    ],
  },
  {
    category: 'Privacy & Security',
    questions: [
      {
        question: 'Are files encrypted?',
        answer: 'Yes, all files are encrypted during transfer using industry-standard TLS encryption. Files are stored securely and can only be accessed via the unique share link.',
      },
      {
        question: 'What happens to files after expiry?',
        answer: 'Once a share expires, the file is permanently and securely deleted from our servers. There is no way to recover expired files.',
      },
      {
        question: 'Do you store any personal data?',
        answer: 'We don\'t require accounts or collect personal information. We only store the files you upload temporarily. No tracking, no cookies, no user profiles.',
      },
    ],
  },
  {
    category: 'Troubleshooting',
    questions: [
      {
        question: 'Share link not working',
        answer: 'The link may have expired or reached its download limit. Check if the expiration time has passed or if the file has been downloaded the maximum number of times.',
      },
      {
        question: 'File upload failed',
        answer: 'Check that your file is under 10GB and try a different browser. If the problem persists, contact us with details about the file you were trying to upload.',
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
