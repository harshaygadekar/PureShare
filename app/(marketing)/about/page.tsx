/**
 * About Page
 * Information about PureShare platform
 */

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { FiHeart, FiUsers, FiTarget } from 'react-icons/fi';

const values = [
  {
    icon: FiHeart,
    title: 'Privacy First',
    description: 'We believe privacy is a fundamental right. Your data belongs to you, and only you.',
  },
  {
    icon: FiUsers,
    title: 'User Focused',
    description: 'Every feature we build is designed with simplicity and user experience in mind.',
  },
  {
    icon: FiTarget,
    title: 'Mission Driven',
    description: 'Our mission is to make secure file sharing accessible to everyone, everywhere.',
  },
];

export default function AboutPage() {
  return (
    <>
      <Section className="bg-background pt-24">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                About PureShare
              </h1>
              <p className="text-xl text-secondary">
                Simple, secure, and privacy-focused file sharing for everyone.
              </p>
            </div>

            <div className="prose prose-invert mx-auto max-w-3xl">
              <div className="space-y-6 text-lg leading-relaxed text-secondary">
                <p>
                  PureShare was born from a simple observation: file sharing shouldn't
                  be complicated, and it definitely shouldn't compromise your privacy.
                  Too many platforms prioritize convenience over security, or make
                  security so complex that it becomes unusable.
                </p>

                <p>
                  We set out to build something different—a platform that combines
                  military-grade security with Apple-level simplicity. A place where
                  you can share files without creating yet another account, where your
                  data is encrypted by default, and where links automatically expire
                  to protect your privacy.
                </p>

                <p>
                  Today, PureShare serves thousands of users worldwide, from individuals
                  sharing family photos to businesses transferring sensitive documents.
                  Our commitment remains unchanged: to provide the most secure, simple,
                  and privacy-focused file sharing experience possible.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-surface">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
              Our Values
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-secondary">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="border border-border bg-background p-8 text-center"
              >
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center bg-elevated">
                    <value.icon className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed text-secondary">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-background">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground">
              Join Our Mission
            </h2>
            <p className="mb-8 text-lg text-secondary">
              We're always looking for talented individuals who share our passion
              for privacy and great user experience. If that sounds like you,
              we'd love to hear from you.
            </p>
            <a
              href="mailto:careers@pureshare.com"
              className="inline-block border border-border px-8 py-3 font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              Get in Touch
            </a>
          </div>
        </Container>
      </Section>
    </>
  );
}
