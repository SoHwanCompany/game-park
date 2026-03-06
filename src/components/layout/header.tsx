import Link from 'next/link';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateLevel } from '@/constants/exp';

import { LogoutButton } from './_components/logout-button';

export const Header = async () => {
  const session = await auth();

  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { nickname: true, exp: true },
      })
    : null;

  const nickname = user?.nickname ?? null;
  const level = calculateLevel(user?.exp ?? 0);

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="size-6"
            fill="none"
            aria-hidden="true"
          >
            <rect x="4" y="10" width="24" height="14" rx="4" fill="currentColor" />
            <circle cx="11" cy="17" r="2" className="fill-background" />
            <circle cx="21" cy="17" r="2" className="fill-background" />
            <rect x="9" y="15" width="1.5" height="4" rx="0.75" className="fill-background" />
            <rect x="12.5" y="15" width="1.5" height="4" rx="0.75" className="fill-background" />
            <rect x="8" y="16.25" width="6" height="1.5" rx="0.75" className="fill-background" />
            <circle cx="19.5" cy="15.5" r="1" className="fill-background" />
            <circle cx="22.5" cy="15.5" r="1" className="fill-background" />
            <circle cx="21" cy="14" r="1" className="fill-background" />
            <circle cx="21" cy="17" r="1" className="fill-background" />
          </svg>
          Game Park
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/games" className="text-muted-foreground hover:text-foreground text-sm">
            게임
          </Link>
          <Link href="/rankings" className="text-muted-foreground hover:text-foreground text-sm">
            랭킹
          </Link>
          <Link href="/feedback" className="text-muted-foreground hover:text-foreground text-sm">
            의견
          </Link>

          {session?.user ? (
            <>
              <Link href="/mypage" className="flex items-center gap-2 hover:opacity-80">
                <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full text-xs font-bold">
                  {nickname?.charAt(0)}
                </div>
                <span className="text-sm font-medium">{nickname}</span>
                <span className="bg-secondary text-secondary-foreground rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                  Lv.{level}
                </span>
              </Link>
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
