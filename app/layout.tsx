import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Bricolage Grotesque - Variable font with full weight range
const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: 'swap',
  // Variable font automatically includes all weights 200-800
});

export const metadata: Metadata = {
  title: "PureShare - Temporary File Sharing",
  description: "Share files temporarily with ephemeral storage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${bricolageGrotesque.variable} antialiased`}
          style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
