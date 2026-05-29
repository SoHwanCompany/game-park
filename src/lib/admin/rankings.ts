import { prisma } from '@/lib/prisma';

interface RankingRow {
  rank: number;
  userId: string;
  nickname: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RankingPageData {
  game: { id: string; title: string; code: string };
  rows: RankingRow[];
}

export const getRankingPageData = async (
  gameId: string,
  limit = 100,
): Promise<RankingPageData | null> => {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { id: true, title: true, code: true },
  });

  if (!game) {
    return null;
  }

  const rankings = await prisma.ranking.findMany({
    where: { gameId },
    orderBy: [{ score: 'desc' }, { updatedAt: 'asc' }],
    take: limit,
    select: {
      score: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      user: { select: { nickname: true } },
    },
  });

  return {
    game,
    rows: rankings.map((row, index) => ({
      rank: index + 1,
      userId: row.userId,
      nickname: row.user.nickname,
      score: row.score,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
  };
};

interface RankingGameOption {
  id: string;
  title: string;
  code: string;
  rankedPlayers: number;
}

export const getRankingGameOptions = async (): Promise<RankingGameOption[]> => {
  const games = await prisma.game.findMany({
    where: { status: { not: 'DRAFT' } },
    orderBy: { title: 'asc' },
    select: {
      id: true,
      title: true,
      code: true,
      _count: { select: { rankings: true } },
    },
  });

  return games.map(({ _count, ...rest }) => ({
    ...rest,
    rankedPlayers: _count.rankings,
  }));
};
