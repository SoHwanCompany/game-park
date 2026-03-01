import { notFound } from 'next/navigation';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GamePlayer } from '@/components/game/game-player';

interface PlayPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { id } = await params;
  const session = await auth();

  const game = await prisma.game.findUnique({
    where: { id, status: 'PUBLISHED' },
    select: { id: true, title: true, gameUrl: true },
  });

  if (!game) {
    notFound();
  }

  let userInfo: { userId: string; nickname: string } | null = null;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, nickname: true },
    });

    if (user) {
      userInfo = { userId: user.id, nickname: user.nickname };
    }
  }

  return (
    <GamePlayer
      gameUrl={game.gameUrl}
      gameTitle={game.title}
      gameId={game.id}
      userId={userInfo?.userId ?? null}
      nickname={userInfo?.nickname ?? null}
      variant="fullscreen"
    />
  );
}
