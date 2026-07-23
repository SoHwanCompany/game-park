import { type Metadata } from 'next';

import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_TITLE, SITE_URL } from '@/lib/site';
import { AnalyticsProvider } from '@/components/providers/analytics-provider';
import { QueryProvider } from '@/components/providers/query-provider';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s | Game Park',
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  alternates: {
    canonical: '/',
  },
  category: 'games',
  applicationName: 'Game Park',
  creator: 'Game Park',
  publisher: 'Game Park',
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Game Park',
    url: '/',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'google-adsense-account':
      process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? 'ca-pub-8131054098817889',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AnalyticsProvider gaMeasurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
