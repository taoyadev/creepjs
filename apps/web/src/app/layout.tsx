import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { defaultMetadata, structuredData } from '@/lib/metadata';
import { StructuredData } from '@/components/StructuredData';
import { CloudflareAnalytics } from '@/components/Analytics';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { PWARegister } from '@/components/PWARegister';
import { Footer } from '@/components/Footer';
import { DynamicHeader } from '@/components/DynamicHeader';
import { ThemeScript } from '@/components/ThemeScript';

// Self-hosted Inter (variable, latin subset): no build-time or runtime
// dependency on Google Fonts — privacy-first and deterministic builds.
const inter = localFont({
  src: '../fonts/inter-latin-variable.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
});

// Use comprehensive metadata configuration
export const metadata: Metadata = defaultMetadata;

// Export viewport configuration (Next.js 15+)
export { viewport } from './viewport';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        {/* JSON-LD Structured Data for SEO */}
        <StructuredData
          data={[
            structuredData.organization(),
            structuredData.website(),
            structuredData.webApplication(),
            structuredData.softwareApplication(),
          ]}
        />
        {/* Favicons and PWA Manifest */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://api.creepjs.org" />
        <link rel="dns-prefetch" href="https://api.creepjs.org" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="CreepJS" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            {/* Global Header - Loads First */}
            <DynamicHeader />

            {/* App Router preserves route-level loading boundaries. Keep the
                server-rendered page shell mounted while client islands suspend. */}
            <main className="flex-1">{children}</main>

            {/* Global Footer - Loads First */}
            <Footer />
          </div>
          {/* Toast notifications */}
          <Toaster position="top-right" expand={false} richColors closeButton />
          {/* PWA Registration */}
          <PWARegister />
        </ThemeProvider>
        {/* Cloudflare Web Analytics - Privacy-first, no cookies */}
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
