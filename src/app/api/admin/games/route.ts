import { type GameStatus } from '@prisma/client';
import { type NextRequest, type NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-guard';
import { getAdminGames, type AdminGameListItem } from '@/lib/admin/games';
import { errorResponse, successResponse } from '@/lib/api';
import { type ApiResponse } from '@/types/api';

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
