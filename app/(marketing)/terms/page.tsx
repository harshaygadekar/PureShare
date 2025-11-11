/**
 * Terms of Service Page
 * Legal terms and conditions for using PureShare
 */

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';

export default function TermsPage() {
  return (
    <Section className="bg-background pt-24">
      <Container>
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground">
              Terms of Service
            </h1>
            <p className="text-lg text-secondary">
              Last updated: November 10, 2025
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Agreement to Terms</h2>
              <p className="leading-relaxed text-secondary">
                By accessing or using PureShare, you agree to be bound by these Terms of
                Service and all applicable laws and regulations. If you do not agree with
                any of these terms, you are prohibited from using or accessing this service.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Use License</h2>
              <p className="mb-4 leading-relaxed text-secondary">
                Permission is granted to temporarily use PureShare for personal or commercial
                file sharing purposes. This license shall not allow you to:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-secondary">
                <li>Modify or copy service materials</li>
                <li>Use the service for any illegal purpose</li>
                <li>Attempt to reverse engineer any aspect of the service</li>
                <li>Remove any copyright or proprietary notations</li>
                <li>Transfer the service to another person or entity</li>
                <li>Use the service in a way that damages, disables, or impairs it</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Acceptable Use</h2>
              <p className="mb-4 leading-relaxed text-secondary">
                You agree to use PureShare only for lawful purposes. You must not use our service:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-secondary">
                <li>To share illegal, harmful, or offensive content</li>
                <li>To distribute malware, viruses, or malicious code</li>
                <li>To infringe on intellectual property rights</li>
                <li>To harass, abuse, or harm others</li>
                <li>To spam or send unsolicited communications</li>
                <li>To violate any applicable laws or regulations</li>
                <li>To share content that violates privacy rights</li>
                <li>To impersonate others or misrepresent your identity</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">File Storage and Limits</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    Storage Duration
                  </h3>
                  <p className="leading-relaxed text-secondary">
                    Files are stored for the duration specified when creating the share link
                    (maximum 7 days). Files are automatically and permanently deleted after
                    the expiration time.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    File Size Limits
                  </h3>
                  <p className="leading-relaxed text-secondary">
                    Free users can upload files up to 5GB per file. Premium users have
                    increased limits. We reserve the right to modify these limits at any time.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    Prohibited Content
                  </h3>
                  <p className="leading-relaxed text-secondary">
                    We prohibit the upload and sharing of illegal content, copyrighted
                    materials without permission, malware, or content that violates our
                    acceptable use policy.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Account Terms</h2>
              <p className="mb-4 leading-relaxed text-secondary">
                If you create an account with us:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-secondary">
                <li>You must be at least 13 years old</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>You are responsible for all activities under your account</li>
                <li>You must notify us immediately of any security breach</li>
                <li>We may terminate your account for violation of these terms</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Intellectual Property</h2>
              <p className="leading-relaxed text-secondary">
                The service and its original content, features, and functionality are owned
                by PureShare and are protected by international copyright, trademark, patent,
                trade secret, and other intellectual property laws. You retain all rights to
                the files you upload. We claim no ownership over your content.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Disclaimer</h2>
              <p className="leading-relaxed text-secondary">
                The service is provided "as is" without warranties of any kind, either express
                or implied. We do not warrant that the service will be uninterrupted, secure,
                or error-free. We do not guarantee the accuracy or reliability of any content
                shared through the service.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Limitation of Liability</h2>
              <p className="leading-relaxed text-secondary">
                PureShare shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages resulting from your use of or inability
                to use the service. This includes, but is not limited to, damages for loss
                of profits, data, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Content Moderation</h2>
              <p className="leading-relaxed text-secondary">
                We reserve the right to review, monitor, and remove content that violates
                these terms. While we employ automated systems and manual reviews, we cannot
                guarantee immediate detection of all violations. Users are encouraged to
                report inappropriate content.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Termination</h2>
              <p className="leading-relaxed text-secondary">
                We may terminate or suspend your account and access to the service immediately,
                without prior notice or liability, for any reason, including breach of these
                Terms. Upon termination, your right to use the service will immediately cease,
                and we will delete your files and account data.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Changes to Terms</h2>
              <p className="leading-relaxed text-secondary">
                We reserve the right to modify these terms at any time. We will notify users
                of material changes via email or through the service. Your continued use of
                the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Governing Law</h2>
              <p className="leading-relaxed text-secondary">
                These terms shall be governed by and construed in accordance with applicable
                laws, without regard to conflict of law provisions. Any disputes arising from
                these terms or the service shall be resolved through binding arbitration.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Contact Information</h2>
              <p className="leading-relaxed text-secondary">
                Questions about these Terms of Service should be sent to:
              </p>
              <div className="mt-4 border border-border bg-surface p-6">
                <p className="text-secondary">
                  <strong className="text-foreground">Email:</strong> legal@pureshare.com
                </p>
                <p className="mt-2 text-secondary">
                  <strong className="text-foreground">Response Time:</strong> Within 5 business days
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Severability</h2>
              <p className="leading-relaxed text-secondary">
                If any provision of these terms is found to be unenforceable or invalid,
                that provision will be limited or eliminated to the minimum extent necessary
                so that these Terms will otherwise remain in full force and effect.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </Section>
  );
}
