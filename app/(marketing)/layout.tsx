/**
 * Marketing Layout
 * Wrapper for all marketing pages (landing, about, etc.)
 */

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-11">
        {children}
      </main>
      <Footer />
    </div>
  );
}
