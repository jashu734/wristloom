import type { Metadata } from 'next';
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';

// ─── Font Definitions ─────────────────────────────────────────
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

// ─── Metadata ────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'Wristloom — Crafted in Time',
    template: '%s — Wristloom',
  },
  description:
    'The definitive digital ecosystem for discovering, owning, maintaining, authenticating, and trading luxury timepieces. Multi-brand commerce, professional authentication, house-call repair, and a personal Watch Vault — all in one platform.',
  keywords: [
    'luxury watches',
    'watch authentication',
    'watch repair',
    'watch vault',
    'pre-owned watches',
    'house call watch service',
    'watch trade-in',
    'horology',
  ],
  authors: [{ name: 'Wristloom' }],
  creator: 'Wristloom',
  metadataBase: new URL('https://wristloom.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://wristloom.com',
    siteName: 'Wristloom',
    title: 'Wristloom — Crafted in Time',
    description:
      'The definitive digital ecosystem for luxury timepiece ownership.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wristloom — Crafted in Time',
    description: 'The definitive digital ecosystem for luxury timepiece ownership.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ─── Root Layout ─────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${ibmPlexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <SessionProvider refetchOnWindowFocus={false}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
