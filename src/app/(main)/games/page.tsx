import { Suspense } from 'react';

import { type Prisma } from '@prisma/client';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { CategoryFilter } from './_components/category-filter';
import { GameList } from './_components/game-list';
import { SortSelect } from './_components/sort-select';

interface GamesPageProps {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const { category, sort } = await searchParams;
  const session = await auth();

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { code: true, name: true },
  });

  const orderBy: Prisma.GameOrderByWithRelationInput = (() => {
    switch (sort) {
      case 'title':
        return { title: 'asc' };
      case 'likes':
        return { likeCount: 'desc' };
      default:
        return { createdAt: 'desc' };
    }
  })();

  const where: Prisma.GameWhereInput = {
    status: 'PUBLISHED',
    ...(category && category !== 'all' ? { category: { code: category } } : {}),
  };

  const games = await prisma.game.findMany({
    where,
    orderBy,
    include: {
      category: { select: { code: true, name: true } },
      ...(session?.user?.id
        ? { gameLikes: { where: { userId: session.user.id }, select: { id: true } } }
        : {}),
    },
  });

  const serializedGames = games.map((game) => ({
    id: game.id,
    code: game.code,
    title: game.title,
    description: game.description,
    thumbnailUrl: game.thumbnailUrl,
    likeCount: game.likeCount,
    playCount: game.playCount,
    category: game.category,
    createdAt: game.createdAt.toISOString(),
    isLiked: 'gameLikes' in game ? (game.gameLikes as { id: string }[]).length > 0 : false,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">게임 목록</h1>
        <p className="text-muted-foreground">다양한 웹 게임을 즐겨보세요.</p>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <Suspense fallback={<div className="bg-muted h-8 w-48 animate-pulse rounded-md" />}>
          <CategoryFilter categories={categories} currentCategory={category} />
        </Suspense>
        <Suspense fallback={<div className="bg-muted h-9 w-28 animate-pulse rounded-md" />}>
          <SortSelect currentSort={sort} />
        </Suspense>
      </div>

      <GameList games={serializedGames} isLoggedIn={Boolean(session?.user)} />
    </div>
  );
}
