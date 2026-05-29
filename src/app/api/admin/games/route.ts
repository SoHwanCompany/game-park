import { type GameStatus } from '@prisma/client';
import { type NextRequest, type NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-guard';
import { recordAdminAction } from '@/lib/admin/audit';
import { getAdminGames, type AdminGameListItem } from '@/lib/admin/games';
import { errorResponse, successResponse } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { type ApiResponse } from '@/types/api';
import { gameFormSchema } from '@/app/(admin)/admin/games/_schemas/game-form';

const VALID_STATUSES: GameStatus[] = ['DRAFT', 'PUBLISHED', 'SUSPENDED', 'ARCHIVED'];

export const GET = async (
  request: NextRequest,
): Promise<NextResponse<ApiResponse<AdminGameListItem[] | null>>> => {
  const guard = await requireAdmin();

  if (!guard.ok) {
    return guard.response;
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status') as GameStatus | null;
  const q = searchParams.get('q') ?? undefined;
  const status = statusParam && VALID_STATUSES.includes(statusParam) ? statusParam : undefined;

  try {
    const games = await getAdminGames({ status, q });

    return successResponse(games, 'OK');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};

export const POST = async (
  request: NextRequest,
): Promise<NextResponse<ApiResponse<{ id: string } | null>>> => {
  const guard = await requireAdmin();

  if (!guard.ok) {
    return guard.response;
  }

  try {
    const body = (await request.json()) as unknown;
    const parsed = gameFormSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const codeTaken = await prisma.game.findUnique({
      where: { code: parsed.data.code },
      select: { id: true },
    });

    if (codeTaken) {
      return errorResponse('GAME_CODE_EXISTS', 409);
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
      select: { id: true },
    });

    if (!categoryExists) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const created = await prisma.game.create({
      data: parsed.data,
      select: { id: true },
    });

    await recordAdminAction(guard.userId, 'GAME_CREATE', created.id, {
      code: parsed.data.code,
      title: parsed.data.title,
    });

    return successResponse(created, '게임이 등록되었습니다.', 201);
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
