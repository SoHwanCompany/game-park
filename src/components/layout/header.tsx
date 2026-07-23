import Image from 'next/image';
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
          <Image
            src="/images/logo.png"
            alt="Game Park"
            width={32}
            height={32}
            className="size-8 rounded-xl"
            priority
          />
          Game Park
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link href="/games" className="text-muted-foreground hover:text-foreground text-sm">
            게임
          </Link>
          <Link href="/guides" className="text-muted-foreground hover:text-foreground text-sm">
            가이드
          </Link>
          <Link href="/rankings" className="text-muted-foreground hover:text-foreground text-sm">
            랭킹
          </Link>
          <Link
            href="/feedback"
            className="text-muted-foreground hover:text-foreground hidden text-sm md:inline"
          >
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
