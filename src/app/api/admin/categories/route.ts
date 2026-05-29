import { type NextRequest, type NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-guard';
import { recordAdminAction } from '@/lib/admin/audit';
import { getAdminCategories, type AdminCategoryListItem } from '@/lib/admin/categories';
import { errorResponse, successResponse } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { type ApiResponse } from '@/types/api';
import { categoryFormSchema } from '@/app/(admin)/admin/categories/_schemas/category-form';

export const GET = async (): Promise<NextResponse<ApiResponse<AdminCategoryListItem[] | null>>> => {
  const guard = await requireAdmin();

  if (!guard.ok) {
    return guard.response;
  }

  try {
    const categories = await getAdminCategories();

    return successResponse(categories, 'OK');
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
    const parsed = categoryFormSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const [codeTaken, nameTaken] = await Promise.all([
      prisma.category.findUnique({ where: { code: parsed.data.code }, select: { id: true } }),
      prisma.category.findUnique({ where: { name: parsed.data.name }, select: { id: true } }),
    ]);

    if (codeTaken) {
      return errorResponse('CATEGORY_CODE_EXISTS', 409);
    }

    if (nameTaken) {
      return errorResponse('CATEGORY_NAME_EXISTS', 409);
    }

    const created = await prisma.category.create({
      data: {
        code: parsed.data.code,
        name: parsed.data.name,
        description: parsed.data.description || null,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
      },
      select: { id: true },
    });

    await recordAdminAction(guard.userId, 'CATEGORY_CREATE', created.id, {
      code: parsed.data.code,
      name: parsed.data.name,
    });

    return successResponse(created, '카테고리가 등록되었습니다.', 201);
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
