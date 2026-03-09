import { type FeedbackStatus } from '@prisma/client';
import { type NextRequest } from 'next/server';

import { errorResponse, successResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES: FeedbackStatus[] = [
  'PENDING',
  'CONFIRMED',
  'IN_REVIEW',
  'RESOLVED',
  'DEFERRED',
];

export const PATCH = async (request: NextRequest, context: RouteContext): Promise<Response> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return errorResponse('FORBIDDEN', 403);
    }

    const { id } = await context.params;

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!feedback) {
      return errorResponse('FEEDBACK_NOT_FOUND', 404);
    }

    const body = (await request.json()) as {
      status?: FeedbackStatus;
      comment?: string;
    };

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const [updatedFeedback] = await prisma.$transaction([
      prisma.feedback.update({
        where: { id },
        data: { status: body.status },
        select: { id: true, status: true },
      }),
      prisma.feedbackStatusLog.create({
        data: {
          feedbackId: id,
          status: body.status,
          comment: body.comment?.trim() ?? null,
          changedBy: session.user.id,
        },
      }),
    ]);

    return successResponse(updatedFeedback, '상태가 변경되었습니다.');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
