import Link from 'next/link';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { LogoutButton } from './_components/logout-button';

export const Header = async () => {
  const session = await auth();

  const nickname = session?.user?.id
    ? (
        await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { nickname: true },
        })
      )?.nickname
    : null;

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

          {session?.user ? (
            <>
              <Link href="/mypage" className="text-muted-foreground hover:text-foreground text-sm">
                마이페이지
              </Link>
              <span className="text-sm font-medium">{nickname}</span>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className="text-muted-foreground hover:text-foreground text-sm">
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
