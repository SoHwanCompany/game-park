import { type Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Game Park',
  description: '다양한 웹 게임을 즐길 수 있는 플랫폼',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
