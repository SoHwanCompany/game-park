import { type ReportReason, type ReportTargetType } from '@prisma/client';
import { type NextRequest } from 'next/server';

import { errorResponse, successResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const VALID_TARGET_TYPES: ReportTargetType[] = ['FEEDBACK', 'COMMENT'];
const VALID_REASONS: ReportReason[] = ['PROFANITY', 'SPAM', 'INAPPROPRIATE', 'OTHER'];

export const POST = async (request: NextRequest): Promise<Response> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { status: true },
    });

    if (user?.status === 'SUSPENDED') {
      return errorResponse('USER_SUSPENDED', 403);
    }

    const body = (await request.json()) as {
      targetType?: ReportTargetType;
      targetId?: string;
      reason?: ReportReason;
      detail?: string;
    };

    const { targetType, targetId, reason, detail } = body;

    if (!targetType || !targetId || !reason) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    if (!VALID_TARGET_TYPES.includes(targetType) || !VALID_REASONS.includes(reason)) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const existing = await prisma.report.findUnique({
      where: {
        reporterId_targetType_targetId: {
          reporterId: session.user.id,
          targetType,
          targetId,
        },
      },
    });

    if (existing) {
      return errorResponse('ALREADY_REPORTED', 409);
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        targetType,
        targetId,
        reason,
        detail: detail?.trim() ?? null,
      },
      select: { id: true },
    });

    return successResponse(report, '신고가 접수되었습니다.', 201);
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
