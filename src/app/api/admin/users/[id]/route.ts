import { type UserRole, type UserStatus } from '@prisma/client';
import { type NextRequest, type NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/admin-guard';
import { recordAdminAction } from '@/lib/admin/audit';
import { errorResponse, successResponse } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { type ApiResponse } from '@/types/api';

const patchSchema = z
  .object({
    status: z.enum(['ACTIVE', 'SUSPENDED', 'WITHDRAWN']).optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
    nickname: z.string().min(1).max(50).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, '변경할 필드가 없습니다.');

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

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const isSelf = guard.userId === id;

    if (isSelf && (parsed.data.status !== undefined || parsed.data.role !== undefined)) {
      return errorResponse('FORBIDDEN', 403);
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, status: true, role: true, nickname: true },
    });

    if (!existing) {
      return errorResponse('USER_NOT_FOUND', 404);
    }

    if (parsed.data.nickname && parsed.data.nickname !== existing.nickname) {
      const taken = await prisma.user.findUnique({
        where: { nickname: parsed.data.nickname },
        select: { id: true },
      });

      if (taken && taken.id !== id) {
        return errorResponse('NICKNAME_EXISTS', 409);
      }
    }

    await prisma.user.update({
      where: { id },
      data: parsed.data,
    });

    if (parsed.data.status !== undefined && parsed.data.status !== existing.status) {
      await recordAdminAction(guard.userId, 'USER_STATUS_CHANGE', id, {
        from: existing.status,
        to: parsed.data.status satisfies UserStatus,
      });
    }

    if (parsed.data.role !== undefined && parsed.data.role !== existing.role) {
      await recordAdminAction(guard.userId, 'USER_ROLE_CHANGE', id, {
        from: existing.role,
        to: parsed.data.role satisfies UserRole,
      });
    }

    if (parsed.data.nickname && parsed.data.nickname !== existing.nickname) {
      await recordAdminAction(guard.userId, 'USER_NICKNAME_CHANGE', id, {
        from: existing.nickname,
        to: parsed.data.nickname,
      });
    }

    return successResponse({ id }, '유저 정보가 변경되었습니다.');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
