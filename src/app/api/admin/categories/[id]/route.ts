import { type NextRequest, type NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-guard';
import { recordAdminAction } from '@/lib/admin/audit';
import { errorResponse, successResponse } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { type ApiResponse } from '@/types/api';
import { categoryFormSchema } from '@/app/(admin)/admin/categories/_schemas/category-form';

const patchSchema = categoryFormSchema.partial();

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<{ id: string } | null>>> => {
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

    const existing = await prisma.category.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return errorResponse('CATEGORY_NOT_FOUND', 404);
    }

    if (parsed.data.code) {
      const codeTaken = await prisma.category.findFirst({
        where: { code: parsed.data.code, NOT: { id } },
        select: { id: true },
      });

      if (codeTaken) {
        return errorResponse('CATEGORY_CODE_EXISTS', 409);
      }
    }

    if (parsed.data.name) {
      const nameTaken = await prisma.category.findFirst({
        where: { name: parsed.data.name, NOT: { id } },
        select: { id: true },
      });

      if (nameTaken) {
        return errorResponse('CATEGORY_NAME_EXISTS', 409);
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(parsed.data.description !== undefined
          ? { description: parsed.data.description || null }
          : {}),
      },
      select: { id: true },
    });

    await recordAdminAction(guard.userId, 'CATEGORY_UPDATE', id, {
      changes: parsed.data,
    });

    return successResponse(updated, '카테고리가 변경되었습니다.');
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

    const existing = await prisma.category.findUnique({
      where: { id },
      select: { id: true, code: true, name: true, _count: { select: { games: true } } },
    });

    if (!existing) {
      return errorResponse('CATEGORY_NOT_FOUND', 404);
    }

    if (existing._count.games > 0) {
      return errorResponse('CATEGORY_HAS_GAMES', 409);
    }

    await prisma.category.delete({ where: { id } });

    await recordAdminAction(guard.userId, 'CATEGORY_DELETE', id, {
      code: existing.code,
      name: existing.name,
    });

    return successResponse({ id }, '카테고리가 삭제되었습니다.');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
