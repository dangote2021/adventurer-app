import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { AuthProvider } from '@/lib/supabase/auth-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://adventurer-outdoor.vercel.app'),
  title: {
    default: 'Adventurer — Compagnon d\'aventure outdoor',
    template: '%s · Adventurer',
  },
  description:
    'L\'app outdoor multi-sports qui réunit préparation, terrain et partage. Coach IA, communauté, marketplace et cartographie — trail, kitesurf, alpinisme, plongée…',
  keywords: [
    'outdoor', 'trail', 'kitesurf', 'alpinisme', 'apnée', 'parapente',
    'coaching sportif IA', 'communauté outdoor', 'app aventure',
  ],
  openGraph: {
    title: 'Adventurer — L\'app des passionnés outdoor',
    description:
      'Préparer, vivre et partager tes aventures outdoor. Multi-sports, communauté et coach IA intégrés.',
    url: 'https://adventurer-outdoor.vercel.app',
    siteName: 'Adventurer',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Adventurer' }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adventurer — L\'app outdoor multi-sports',
    description: 'Trail, kitesurf, alpinisme, apnée… réunis dans une seule app.',
    images: ['/logo.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Adventurer',
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1B4332',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#1B4332" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Adventurer" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <meta name="application-name" content="Adventurer" />
        <meta name="msapplication-TileColor" content="#1B4332" />
        <meta name="msapplication-TileImage" content="/icon-144.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SW registered:', reg.scope))
                    .catch(err => console.warn('SW registration failed:', err));
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-bg text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
