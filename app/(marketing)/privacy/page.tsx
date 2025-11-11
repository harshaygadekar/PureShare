/**
 * Privacy Policy Page
 * Comprehensive privacy policy and data handling practices
 */

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';

export default function PrivacyPage() {
  return (
    <Section className="bg-background pt-24">
      <Container>
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground">
              Privacy Policy
            </h1>
            <p className="text-lg text-secondary">
              Last updated: November 10, 2025
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Introduction</h2>
              <p className="leading-relaxed text-secondary">
                At PureShare, we take your privacy seriously. This Privacy Policy explains
                how we collect, use, disclose, and safeguard your information when you use
                our file sharing service. Please read this privacy policy carefully. If you
                do not agree with the terms of this privacy policy, please do not access
                the site.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    Files You Upload
                  </h3>
                  <p className="leading-relaxed text-secondary">
                    We store the files you upload temporarily for the duration of the share
                    link validity. Files are encrypted at rest and automatically deleted
                    when the share link expires.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    Usage Information
                  </h3>
                  <p className="leading-relaxed text-secondary">
                    We collect information about how you interact with our service, including
                    access times, pages viewed, and the actions you take. This helps us
                    improve the service and provide better user experience.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    Account Information
                  </h3>
                  <p className="leading-relaxed text-secondary">
                    If you create an account, we collect your email address, name, and
                    encrypted password. We never store passwords in plain text.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">How We Use Your Information</h2>
              <ul className="list-disc space-y-2 pl-6 text-secondary">
                <li>To provide, operate, and maintain our file sharing service</li>
                <li>To improve, personalize, and expand our service</li>
                <li>To understand and analyze how you use our service</li>
                <li>To develop new products, services, features, and functionality</li>
                <li>To communicate with you for customer service and support</li>
                <li>To send you updates and security alerts</li>
                <li>To prevent fraud and enhance security</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Data Security</h2>
              <p className="leading-relaxed text-secondary">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-secondary">
                <li>End-to-end encryption for all file transfers</li>
                <li>AES-256 encryption for data at rest</li>
                <li>Regular security audits and penetration testing</li>
                <li>Secure cloud infrastructure with 99.9% uptime</li>
                <li>Automatic file deletion after expiration</li>
                <li>No third-party access to your files</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Data Retention</h2>
              <p className="leading-relaxed text-secondary">
                Files are automatically deleted when share links expire. You can also
                manually delete shares at any time through your dashboard. Account data
                is retained until you request account deletion. We comply with all
                applicable data retention laws and regulations.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Your Rights</h2>
              <p className="mb-4 leading-relaxed text-secondary">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-secondary">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to data processing</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Third-Party Services</h2>
              <p className="leading-relaxed text-secondary">
                We use trusted third-party services to operate our platform, including
                cloud storage providers and payment processors. These services have their
                own privacy policies and security measures. We carefully vet all
                third-party providers to ensure they meet our security standards.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Cookies and Tracking</h2>
              <p className="leading-relaxed text-secondary">
                We use essential cookies to maintain your session and provide basic
                functionality. We do not use third-party advertising cookies or sell
                your data to advertisers. You can control cookie preferences in your
                browser settings.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Children's Privacy</h2>
              <p className="leading-relaxed text-secondary">
                Our service is not intended for children under 13 years of age. We do
                not knowingly collect personal information from children. If you believe
                we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Changes to This Policy</h2>
              <p className="leading-relaxed text-secondary">
                We may update this privacy policy from time to time. We will notify you
                of any changes by posting the new privacy policy on this page and updating
                the "Last updated" date. You are advised to review this policy periodically
                for any changes.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Contact Us</h2>
              <p className="leading-relaxed text-secondary">
                If you have questions or concerns about this privacy policy or our data
                practices, please contact us at:
              </p>
              <div className="mt-4 border border-border bg-surface p-6">
                <p className="text-secondary">
                  <strong className="text-foreground">Email:</strong> privacy@pureshare.com
                </p>
                <p className="mt-2 text-secondary">
                  <strong className="text-foreground">Response Time:</strong> Within 48 hours
                </p>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </Section>
  );
}
