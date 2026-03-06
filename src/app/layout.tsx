import { type Metadata } from 'next';

import { QueryProvider } from '@/components/providers/query-provider';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://game-park.vercel.app'),
  title: {
    default: 'Game Park - 무료 웹 게임 플랫폼',
    template: '%s | Game Park',
  },
  description:
    '브라우저에서 바로 즐기는 무료 웹 게임 플랫폼. 설치 없이 퍼즐, 아케이드, 전략 게임을 플레이하세요.',
  keywords: ['무료 웹 게임', '브라우저 게임', '온라인 게임', '캐주얼 게임', '게임파크'],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Game Park',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
