import { type Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground mt-4">페이지를 찾을 수 없습니다.</p>
    </div>
  );
}
