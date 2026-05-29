import { Prisma } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import { type NextRequest } from 'next/server';

import { errorResponse, successResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const POST = async (_request: NextRequest, context: RouteContext): Promise<Response> => {
  try {
    const { id: gameId } = await context.params;

    const game = await prisma.game.findFirst({
      where: { id: gameId, status: 'PUBLISHED' },
      select: { id: true },
    });

    if (!game) {
      return errorResponse('GAME_NOT_FOUND', 404);
    }

    const session = await auth();
    const userId = session?.user?.id ?? null;

    const [updated] = await prisma.$transaction([
      prisma.game.update({
        where: { id: gameId },
        data: { playCount: { increment: 1 } },
        select: { playCount: true },
      }),
      prisma.playEvent.create({
        data: { gameId, userId },
        select: { id: true },
      }),
    ]);

    revalidateTag('games', 'default');

    return successResponse({ playCount: updated.playCount }, '플레이 카운트가 증가했습니다.');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return errorResponse('GAME_NOT_FOUND', 404);
    }

    return errorResponse('INTERNAL_ERROR', 500);
  }
};
