import Link from 'next/link';

export const Header = () => {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          Game Park
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/games" className="text-muted-foreground hover:text-foreground text-sm">
            게임
          </Link>
          <Link href="/login" className="text-muted-foreground hover:text-foreground text-sm">
            로그인
          </Link>
        </nav>
      </div>
    </header>
  );
};
