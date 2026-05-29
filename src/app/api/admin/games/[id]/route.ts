import { type GameStatus } from '@prisma/client';
import { type NextRequest, type NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-guard';
import { recordAdminAction } from '@/lib/admin/audit';
import { errorResponse, successResponse } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { type ApiResponse } from '@/types/api';
import { gameFormSchema } from '@/app/(admin)/admin/games/_schemas/game-form';

const patchSchema = gameFormSchema.omit({ code: true }).partial();

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
    const body = (await request.json()) as unknown;
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const existing = await prisma.game.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!existing) {
      return errorResponse('GAME_NOT_FOUND', 404);
    }

    if (parsed.data.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: parsed.data.categoryId },
        select: { id: true },
      });

      if (!categoryExists) {
        return errorResponse('VALIDATION_ERROR', 400);
      }
    }

    const updated = await prisma.game.update({
      where: { id },
      data: parsed.data,
      select: { id: true, status: true },
    });

    const fieldNames = Object.keys(parsed.data);
    const isStatusOnly = fieldNames.length === 1 && fieldNames[0] === 'status';

    await recordAdminAction(guard.userId, isStatusOnly ? 'GAME_STATUS_CHANGE' : 'GAME_UPDATE', id, {
      changes: parsed.data,
      ...(parsed.data.status ? { fromStatus: existing.status } : {}),
    });

    return successResponse(updated, '게임이 변경되었습니다.');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};

export const DELETE = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<{ id: string } | null>>> => {
  const guard = await requireAdmin();

  if (!guard.ok) {
    return guard.response;
  }

  try {
    const { id } = await params;

    const existing = await prisma.game.findUnique({
      where: { id },
      select: { id: true, title: true, code: true },
    });

    if (!existing) {
      return errorResponse('GAME_NOT_FOUND', 404);
    }

    await prisma.game.delete({ where: { id } });

    await recordAdminAction(guard.userId, 'GAME_DELETE', id, {
      code: existing.code,
      title: existing.title,
    });

    return successResponse({ id }, '게임이 삭제되었습니다.');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
