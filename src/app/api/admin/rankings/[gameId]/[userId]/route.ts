import { type NextRequest, type NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-guard';
import { recordAdminAction } from '@/lib/admin/audit';
import { errorResponse, successResponse } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { type ApiResponse } from '@/types/api';

export const DELETE = async (
  _request: NextRequest,
  { params }: { params: Promise<{ gameId: string; userId: string }> },
): Promise<NextResponse<ApiResponse<{ gameId: string; userId: string } | null>>> => {
  const guard = await requireAdmin();

  if (!guard.ok) {
    return guard.response;
  }

  try {
    const { gameId, userId } = await params;

    const ranking = await prisma.ranking.findUnique({
      where: { userId_gameId: { userId, gameId } },
      select: { score: true },
    });

    if (!ranking) {
      return errorResponse('RANKING_NOT_FOUND', 404);
    }

    await prisma.ranking.delete({
      where: { userId_gameId: { userId, gameId } },
    });

    await recordAdminAction(guard.userId, 'RANKING_ROW_DELETE', null, {
      gameId,
      userId,
      score: ranking.score,
    });

    return successResponse({ gameId, userId }, '랭킹 행이 삭제되었습니다.');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
