import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="border-t">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-col items-center justify-center gap-2 px-4 py-4 sm:flex-row sm:justify-between">
        <p className="text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Game Park. All rights reserved.
        </p>
        <nav
          aria-label="푸터 링크"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
        >
          <Link href="/about" className="text-muted-foreground hover:text-foreground text-sm">
            소개
          </Link>
          <Link href="/guides" className="text-muted-foreground hover:text-foreground text-sm">
            플레이 가이드
          </Link>
          <Link
            href="/editorial-policy"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            편집 원칙
          </Link>
          <Link href="/terms" className="text-muted-foreground hover:text-foreground text-sm">
            이용약관
          </Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm">
            개인정보처리방침
          </Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground text-sm">
            문의
          </Link>
        </nav>
      </div>
    </footer>
  );
};
