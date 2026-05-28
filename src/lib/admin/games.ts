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
