import { type FeedbackStatus } from '@prisma/client';
import { type NextRequest, type NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/admin-guard';
import { recordAdminAction } from '@/lib/admin/audit';
import { errorResponse, successResponse } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { type ApiResponse } from '@/types/api';

const bodySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_REVIEW', 'RESOLVED', 'DEFERRED']),
  comment: z.string().max(500).nullable().optional(),
});

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<{ id: string; status: FeedbackStatus } | null>>> => {
  const guard = await requireAdmin();

  if (!guard.ok) {
    return guard.response;
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as unknown;
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const existing = await prisma.feedback.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!existing) {
      return errorResponse('FEEDBACK_NOT_FOUND', 404);
    }

    if (existing.status === parsed.data.status) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const [updated] = await prisma.$transaction([
      prisma.feedback.update({
        where: { id },
        data: { status: parsed.data.status },
        select: { id: true, status: true },
      }),
      prisma.feedbackStatusLog.create({
        data: {
          feedbackId: id,
          status: parsed.data.status,
          comment: parsed.data.comment ?? null,
          changedBy: guard.userId,
        },
      }),
    ]);

    await recordAdminAction(guard.userId, 'FEEDBACK_STATUS_CHANGE', id, {
      from: existing.status,
      to: parsed.data.status,
      ...(parsed.data.comment ? { comment: parsed.data.comment } : {}),
    });

    return successResponse(updated, '상태가 변경되었습니다.');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
