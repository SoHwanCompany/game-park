import { type NextRequest, type NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/admin-guard';
import { recordAdminAction } from '@/lib/admin/audit';
import { errorResponse, successResponse } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { type ApiResponse } from '@/types/api';

const bodySchema = z.object({
  reason: z.string().min(1).max(500),
});

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> },
): Promise<NextResponse<ApiResponse<{ deleted: number } | null>>> => {
  const guard = await requireAdmin();

  if (!guard.ok) {
    return guard.response;
  }

  try {
    const { gameId } = await params;
    const body = (await request.json()) as unknown;
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, title: true },
    });

    if (!game) {
      return errorResponse('GAME_NOT_FOUND', 404);
    }

    const result = await prisma.ranking.deleteMany({ where: { gameId } });

    await recordAdminAction(guard.userId, 'RANKING_RESET', gameId, {
      gameTitle: game.title,
      deletedRows: result.count,
      reason: parsed.data.reason,
    });

    return successResponse({ deleted: result.count }, `${result.count}건의 랭킹이 리셋되었습니다.`);
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
