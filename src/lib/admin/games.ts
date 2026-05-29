import { type GameStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';

interface GetAdminGamesParams {
  status?: GameStatus;
  q?: string;
  limit?: number;
}

export interface AdminGameListItem {
  id: string;
  code: string;
  title: string;
  thumbnailUrl: string;
  status: GameStatus;
  playCount: number;
  likeCount: number;
  createdAt: Date;
  category: { id: string; name: string };
}

interface AdminGameDetail {
  id: string;
  code: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  gameUrl: string;
  status: GameStatus;
  categoryId: string;
  playCount: number;
  likeCount: number;
}

interface GameDailyPoint {
  date: string;
  plays: number;
  likes: number;
}

interface GameStats {
  totals: {
    playCount: number;
    likeCount: number;
    averageScore: number | null;
    rankedPlayers: number;
  };
  timeseries: GameDailyPoint[];
  topRankings: Array<{
    rank: number;
    userId: string;
    nickname: string;
    score: number;
    updatedAt: Date;
  }>;
}

const formatGameDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getGameStats = async (gameId: string, days = 30): Promise<GameStats | null> => {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { id: true, playCount: true, likeCount: true },
  });

  if (!game) {
    return null;
  }

  const start = new Date();

  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days + 1);

  const [plays, likes, rankings, scoreAggregate] = await Promise.all([
    prisma.playEvent.findMany({
      where: { gameId, playedAt: { gte: start } },
      select: { playedAt: true },
    }),
    prisma.gameLike.findMany({
      where: { gameId, createdAt: { gte: start } },
      select: { createdAt: true },
    }),
    prisma.ranking.findMany({
      where: { gameId },
      orderBy: [{ score: 'desc' }, { updatedAt: 'asc' }],
      take: 50,
      select: {
        score: true,
        updatedAt: true,
        userId: true,
        user: { select: { nickname: true } },
      },
    }),
    prisma.ranking.aggregate({
      where: { gameId },
      _avg: { score: true },
      _count: { userId: true },
    }),
  ]);

  const buckets = new Map<string, GameDailyPoint>();

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(start);

    date.setDate(start.getDate() + offset);

    const key = formatGameDateKey(date);

    buckets.set(key, { date: key, plays: 0, likes: 0 });
  }

  plays.forEach(({ playedAt }) => {
    const bucket = buckets.get(formatGameDateKey(playedAt));

    if (bucket) {
      bucket.plays += 1;
    }
  });

  likes.forEach(({ createdAt }) => {
    const bucket = buckets.get(formatGameDateKey(createdAt));

    if (bucket) {
      bucket.likes += 1;
    }
  });

  return {
    totals: {
      playCount: game.playCount,
      likeCount: game.likeCount,
      averageScore: scoreAggregate._avg.score ?? null,
      rankedPlayers: scoreAggregate._count.userId,
    },
    timeseries: Array.from(buckets.values()),
    topRankings: rankings.map((row, index) => ({
      rank: index + 1,
      userId: row.userId,
      nickname: row.user.nickname,
      score: row.score,
      updatedAt: row.updatedAt,
    })),
  };
};

export const getAdminGameById = async (id: string): Promise<AdminGameDetail | null> => {
  return prisma.game.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      title: true,
      description: true,
      thumbnailUrl: true,
      gameUrl: true,
      status: true,
      categoryId: true,
      playCount: true,
      likeCount: true,
    },
  });
};

export const getAdminGames = async ({ status, q, limit = 50 }: GetAdminGamesParams = {}): Promise<
  AdminGameListItem[]
> => {
  return prisma.game.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      code: true,
      title: true,
      thumbnailUrl: true,
      status: true,
      playCount: true,
      likeCount: true,
      createdAt: true,
      category: { select: { id: true, name: true } },
    },
  });
};
