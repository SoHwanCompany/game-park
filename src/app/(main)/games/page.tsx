import { Suspense } from 'react';

import { type Prisma } from '@prisma/client';
import { type Metadata } from 'next';
import { unstable_cache } from 'next/cache';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { CategoryFilter } from '../_components/category-filter';
import { GameList } from './_components/game-list';
import { SortSelect } from './_components/sort-select';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://game-park.vercel.app';

const getCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { code: true, name: true },
    });
  },
  ['categories'],
  { revalidate: 3600 },
);

const getGames = unstable_cache(
  async (sort?: string, category?: string) => {
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

    return prisma.game.findMany({
      where: {
        status: 'PUBLISHED',
        ...(category && category !== 'all' ? { category: { code: category } } : {}),
      },
      orderBy,
      include: { category: { select: { code: true, name: true } } },
    });
  },
  ['games-list'],
  { revalidate: 60, tags: ['games'] },
);

interface GamesPageProps {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

const generateMetadata = async ({ searchParams }: GamesPageProps): Promise<Metadata> => {
  const { category } = await searchParams;

  let title = '무료 웹 게임 모음';

  if (category && category !== 'all') {
    const found = await prisma.category.findFirst({
      where: { code: category, isActive: true },
      select: { name: true },
    });

    if (found) {
      title = `${found.name} 게임 모음`;
    }
  }

  return {
    title,
    description:
      'Game Park에서 다양한 웹 게임을 무료로 즐기세요. 퍼즐, 액션, 전략 등 카테고리별 게임을 브라우저에서 바로 플레이.',
    openGraph: {
      title,
      description:
        'Game Park에서 다양한 웹 게임을 무료로 즐기세요. 퍼즐, 액션, 전략 등 카테고리별 게임을 브라우저에서 바로 플레이.',
    },
  };
};

export { generateMetadata };

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const { category, sort } = await searchParams;
  const session = await auth();

  const categories = await getCategories();
  const games = await getGames(sort, category);

  let likedGameIds: Set<string> = new Set();

  if (session?.user?.id) {
    const likes = await prisma.gameLike.findMany({
      where: { userId: session.user.id, gameId: { in: games.map((g) => g.id) } },
      select: { gameId: true },
    });

    likedGameIds = new Set(likes.map((l) => l.gameId));
  }

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
    isLiked: likedGameIds.has(game.id),
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: serializedGames.map((game, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: game.title,
      url: `${BASE_URL}/games/${game.id}`,
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
