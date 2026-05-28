import { type ReportTargetType } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export interface AdminOverview {
  totalUsers: number;
  newUsersToday: number;
  newLikesToday: number;
  pendingFeedbacks: number;
  pendingReports: number;
}

const getStartOfToday = (): Date => {
  const now = new Date();

  now.setHours(0, 0, 0, 0);

  return now;
};

export const getAdminOverview = async (): Promise<AdminOverview> => {
  const startOfToday = getStartOfToday();

  const [totalUsers, newUsersToday, newLikesToday, pendingFeedbacks, pendingReports] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.gameLike.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.feedback.count({ where: { status: 'PENDING' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

  return { totalUsers, newUsersToday, newLikesToday, pendingFeedbacks, pendingReports };
};

interface TopPlayedGame {
  id: string;
  title: string;
  playCount: number;
  likeCount: number;
}

export const getTopPlayedGames = async (limit = 10): Promise<TopPlayedGame[]> => {
  return prisma.game.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { playCount: 'desc' },
    take: limit,
    select: { id: true, title: true, playCount: true, likeCount: true },
  });
};

interface TrendingLikedGame {
  id: string;
  title: string;
  recentLikes: number;
}

export const getTrendingLikedGames = async (limit = 10): Promise<TrendingLikedGame[]> => {
  const sevenDaysAgo = new Date();

  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const grouped = await prisma.gameLike.groupBy({
    by: ['gameId'],
    where: { createdAt: { gte: sevenDaysAgo } },
    _count: { gameId: true },
    orderBy: { _count: { gameId: 'desc' } },
    take: limit,
  });

  if (grouped.length === 0) {
    return [];
  }

  const games = await prisma.game.findMany({
    where: { id: { in: grouped.map((row) => row.gameId) } },
    select: { id: true, title: true },
  });

  const titleMap = new Map(games.map((game) => [game.id, game.title]));

  return grouped.map((row) => ({
    id: row.gameId,
    title: titleMap.get(row.gameId) ?? '(삭제된 게임)',
    recentLikes: row._count.gameId,
  }));
};

interface ReportedTarget {
  targetType: ReportTargetType;
  targetId: string;
  reportCount: number;
}

export const getMostReportedTargets = async (limit = 10): Promise<ReportedTarget[]> => {
  const grouped = await prisma.report.groupBy({
    by: ['targetType', 'targetId'],
    where: { status: 'PENDING' },
    _count: { targetId: true },
    orderBy: { _count: { targetId: 'desc' } },
    take: limit,
  });

  return grouped.map((row) => ({
    targetType: row.targetType,
    targetId: row.targetId,
    reportCount: row._count.targetId,
  }));
};
