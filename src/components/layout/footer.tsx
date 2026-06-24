import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="border-t">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-col items-center justify-center gap-2 px-4 py-4 sm:flex-row sm:justify-between">
        <p className="text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Game Park. All rights reserved.
        </p>
        <nav aria-label="푸터 링크" className="flex items-center gap-4">
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm">
            개인정보처리방침
          </Link>
        </nav>
      </div>
    </footer>
  );
};
