import { type NextRequest } from 'next/server';

import { errorResponse, successResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const POST = async (request: NextRequest, context: RouteContext): Promise<Response> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 401);
    }

    const { id: gameId } = await context.params;
    const userId = session.user.id;
    const body = (await request.json()) as { score: unknown };

    if (typeof body.score !== 'number' || !Number.isFinite(body.score)) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId, status: 'PUBLISHED' },
      select: { id: true },
    });

    if (!game) {
      return errorResponse('GAME_NOT_FOUND', 404);
    }

    const existing = await prisma.ranking.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });

    if (existing && existing.score >= body.score) {
      return successResponse(
        { score: existing.score, isNewRecord: false },
        '기존 최고 점수가 더 높습니다.',
      );
    }

    const ranking = await prisma.ranking.upsert({
      where: { userId_gameId: { userId, gameId } },
      update: { score: body.score },
      create: { userId, gameId, score: body.score },
    });

    return successResponse(
      { score: ranking.score, isNewRecord: true },
      '새로운 최고 점수를 기록했습니다!',
    );
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
