import { Suspense } from 'react';

import { type Metadata } from 'next';
import { unstable_cache } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { SITE_NAME } from '@/lib/site';
import { type GameRankingSortType } from '@/types/ranking';
import { GAME_RANKING_LIMIT } from '@/constants/ranking';

import { CategoryFilter } from '../_components/category-filter';
import { GameRankingList } from './_components/game-ranking-list';
import { RankingSortToggle } from './_components/ranking-sort-toggle';

export const metadata: Metadata = {
  title: '직장인 쉬는 시간 인기 게임 랭킹',
  description:
    'Game Park에서 직장인 쉬는 시간에 많이 플레이한 인기 브라우저 미니게임 랭킹을 확인하세요.',
  alternates: {
    canonical: '/rankings',
  },
  openGraph: {
    title: `직장인 쉬는 시간 인기 게임 랭킹 | ${SITE_NAME}`,
    description:
      'Game Park에서 직장인 쉬는 시간에 많이 플레이한 인기 브라우저 미니게임 랭킹을 확인하세요.',
    url: '/rankings',
  },
};

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

const getRankedGames = unstable_cache(
  async (sortType: string, category?: string) => {
    return prisma.game.findMany({
      where: {
        status: 'PUBLISHED',
        ...(category && category !== 'all' ? { category: { code: category } } : {}),
      },
      orderBy: sortType === 'plays' ? { playCount: 'desc' } : { likeCount: 'desc' },
      take: GAME_RANKING_LIMIT,
      select: {
        id: true,
        code: true,
        title: true,
        thumbnailUrl: true,
        likeCount: true,
        playCount: true,
        category: { select: { code: true, name: true } },
      },
    });
  },
  ['ranked-games'],
  { revalidate: 30, tags: ['games', 'rankings'] },
);

interface RankingsPageProps {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

export default async function RankingsPage({ searchParams }: RankingsPageProps) {
  const { category, sort } = await searchParams;
  const sortType: GameRankingSortType = sort === 'plays' ? 'plays' : 'likes';

  const categories = await getCategories();
  const games = await getRankedGames(sortType, category);

  const rankedGames = games.map((game, index) => ({
    ...game,
    rank: index + 1,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">직장인 쉬는 시간 인기 게임 랭킹</h1>
        <p className="text-muted-foreground">
          점심시간과 짧은 휴식 시간에 많이 플레이한 인기 게임 TOP 20을 확인해보세요.
        </p>
      </div>

      {/* useSearchParams()의 SSR 경계 처리를 위해 Suspense 래핑 */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <Suspense fallback={<div className="bg-muted h-8 w-48 animate-pulse rounded-md" />}>
          <CategoryFilter categories={categories} currentCategory={category} basePath="/rankings" />
        </Suspense>
        <Suspense fallback={<div className="bg-muted h-8 w-40 animate-pulse rounded-md" />}>
          <RankingSortToggle currentSort={sortType} />
        </Suspense>
      </div>

      <GameRankingList games={rankedGames} sortType={sortType} />
    </div>
  );
}
