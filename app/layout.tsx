/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Root layout with theme provider, navigation, and global styles
 */
import { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { DemoBanner } from '@/components/demo-banner';
import { MatrixBackground } from '@/components/matrix-background';
import { PageTransition } from '@/components/page-transition';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import './interactions.css';

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'ModelViz',
    template: '%s | ModelViz',
  },
  description: 'Compare leading AI models side by side with real-time performance metrics and interactive visualisations',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'ModelViz',
    description: 'Interactive AI Model Comparison Tool',
    siteName: 'ModelViz'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ModelViz',
    description: 'Interactive AI Model Comparison Tool',
    creator: 'Thomas J Butler'
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/modelviz.png', type: 'image/png', sizes: '32x32' }
    ],
    shortcut: '/modelviz.png',
    apple: '/modelviz.png'
  }
};

/**
 * Root layout component
 * @constructor
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Run migration on client side only
  if (typeof window !== 'undefined') {
    import('@/lib/utils/migrate-storage').then(({ migrateLocalStorage }) => {
      migrateLocalStorage();
    });
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="scroll-smooth"
    >
      <head>
        <meta name="application-name" content="ModelViz" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="ModelViz" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0d0d0d" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/icons/favicon-16x16.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icons/favicon-32x32.svg" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={jetBrainsMono.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <MatrixBackground />
          <PageTransition>
            <div className="content-wrapper min-h-screen flex flex-col">
              <DemoBanner />
              <Navigation />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </PageTransition>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
