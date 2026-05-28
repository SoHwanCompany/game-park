import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getAdminGameById } from '@/lib/admin/games';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';

import { DeleteGameButton } from '../_components/delete-game-button';
import { GameForm } from '../_components/game-form';

interface AdminEditGamePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditGamePage({ params }: AdminEditGamePageProps) {
  const { id } = await params;

  const [game, categories] = await Promise.all([
    getAdminGameById(id),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  if (!game) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">게임 편집</h2>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm tabular-nums">
            플레이 {game.playCount.toLocaleString()} · 좋아요 {game.likeCount.toLocaleString()}
          </span>
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/games/${game.id}/stats`}>통계</Link>
          </Button>
        </div>
      </div>

      <GameForm
        mode="edit"
        gameId={game.id}
        categories={categories}
        defaultValues={{
          code: game.code,
          title: game.title,
          description: game.description,
          categoryId: game.categoryId,
          thumbnailUrl: game.thumbnailUrl,
          gameUrl: game.gameUrl,
          status: game.status,
        }}
      />

      <div className="border-destructive/30 rounded-lg border p-4">
        <h3 className="text-destructive mb-2 text-sm font-semibold">위험 영역</h3>
        <DeleteGameButton gameId={game.id} gameTitle={game.title} />
      </div>
    </div>
  );
}
