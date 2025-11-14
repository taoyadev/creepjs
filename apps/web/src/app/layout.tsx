import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { defaultMetadata, structuredData } from '@/lib/metadata';
import { StructuredData } from '@/components/StructuredData';
import { CloudflareAnalytics } from '@/components/Analytics';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { PWARegister } from '@/components/PWARegister';
import { Footer } from '@/components/Footer';
import { DynamicHeader } from '@/components/DynamicHeader';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en" className="dark">
      <head>
        {/* JSON-LD Structured Data for SEO */}
        <StructuredData
          data={[
            structuredData.organization(),
            structuredData.website(),
            structuredData.webApplication(),
          ]}
        />
        {/* Favicons and PWA Manifest */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta
          name="theme-color"
          content="#ffffff"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#0f172a"
          media="(prefers-color-scheme: dark)"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="CreepJS 2.0" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            {/* Global Header - Loads First */}
            <DynamicHeader />

            {/* Main content - Loads with Suspense */}
            <main className="flex-1">
              <Suspense
                fallback={
                  <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse space-y-4">
                      <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-800"></div>
                      <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800"></div>
                      <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-800"></div>
                    </div>
                  </div>
                }
              >
                {children}
              </Suspense>
            </main>

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
