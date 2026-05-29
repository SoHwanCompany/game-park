import { type NextRequest, type NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/admin-guard';
import { recordAdminAction } from '@/lib/admin/audit';
import { errorResponse, successResponse } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { type ApiResponse } from '@/types/api';

const bodySchema = z.object({
  action: z.enum(['dismiss', 'hide-target']),
});

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
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const report = await prisma.report.findUnique({
      where: { id },
      select: { id: true, targetType: true, targetId: true, status: true },
    });

    if (!report) {
      return errorResponse('REPORT_NOT_FOUND', 404);
    }

    if (report.status !== 'PENDING') {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const now = new Date();

    if (parsed.data.action === 'dismiss') {
      await prisma.report.update({
        where: { id },
        data: { status: 'DISMISSED', resolvedBy: guard.userId, resolvedAt: now },
      });

      await recordAdminAction(guard.userId, 'REPORT_RESOLVE', id, {
        action: 'dismiss',
        targetType: report.targetType,
        targetId: report.targetId,
      });

      return successResponse({ id }, '신고를 유지로 처리했습니다.');
    }

    // hide-target
    const updateTarget =
      report.targetType === 'FEEDBACK'
        ? prisma.feedback.update({
            where: { id: report.targetId },
            data: { isPublic: false },
          })
        : prisma.feedbackComment.update({
            where: { id: report.targetId },
            data: { deletedAt: now },
          });

    await prisma.$transaction([
      updateTarget,
      prisma.report.updateMany({
        where: {
          targetType: report.targetType,
          targetId: report.targetId,
          status: 'PENDING',
        },
        data: { status: 'ACTIONED', resolvedBy: guard.userId, resolvedAt: now },
      }),
    ]);

    await recordAdminAction(guard.userId, 'REPORT_HIDE_TARGET', report.targetId, {
      targetType: report.targetType,
      triggeredByReportId: id,
    });

    return successResponse({ id }, '대상을 숨기고 관련 신고를 조치 완료로 변경했습니다.');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
