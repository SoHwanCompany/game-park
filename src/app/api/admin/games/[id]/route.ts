import { type GameStatus } from '@prisma/client';
import { type NextRequest, type NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-guard';
import { recordAdminAction } from '@/lib/admin/audit';
import { errorResponse, successResponse } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { type ApiResponse } from '@/types/api';

const VALID_STATUSES: GameStatus[] = ['DRAFT', 'PUBLISHED', 'SUSPENDED', 'ARCHIVED'];

interface PatchResult {
  id: string;
  status: GameStatus;
}

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<PatchResult | null>>> => {
  const guard = await requireAdmin();

  if (!guard.ok) {
    return guard.response;
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as { status?: GameStatus };
    const status = body.status;

    if (!status || !VALID_STATUSES.includes(status)) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const existing = await prisma.game.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!existing) {
      return errorResponse('GAME_NOT_FOUND', 404);
    }

    if (existing.status === status) {
      return successResponse({ id, status }, '변경 사항이 없습니다.');
    }

    const updated = await prisma.game.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });

    await recordAdminAction(guard.userId, 'GAME_STATUS_CHANGE', id, {
      from: existing.status,
      to: status,
    });

    return successResponse(updated, '게임 상태가 변경되었습니다.');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
