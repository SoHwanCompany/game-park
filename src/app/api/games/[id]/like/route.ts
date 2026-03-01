import { type NextRequest } from 'next/server';

import { errorResponse, successResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const POST = async (_request: NextRequest, context: RouteContext): Promise<Response> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 401);
    }

    const { id: gameId } = await context.params;
    const userId = session.user.id;

    const game = await prisma.game.findFirst({
      where: { id: gameId, status: 'PUBLISHED' },
      select: { id: true },
    });

    if (!game) {
      return errorResponse('GAME_NOT_FOUND', 404);
    }

    const existingLike = await prisma.gameLike.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });

    if (existingLike) {
      const [, updated] = await prisma.$transaction([
        prisma.gameLike.delete({ where: { id: existingLike.id } }),
        prisma.game.update({
          where: { id: gameId },
          data: { likeCount: { decrement: 1 } },
          select: { likeCount: true },
        }),
      ]);

      return successResponse(
        { isLiked: false, likeCount: updated.likeCount },
        '좋아요를 취소했습니다.',
      );
    }

    const [, updated] = await prisma.$transaction([
      prisma.gameLike.create({ data: { userId, gameId } }),
      prisma.game.update({
        where: { id: gameId },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true },
      }),
    ]);

    return successResponse({ isLiked: true, likeCount: updated.likeCount }, '좋아요를 눌렀습니다.');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
