import { type NextRequest } from 'next/server';

import { errorResponse, successResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const POST = async (request: NextRequest, context: RouteContext): Promise<Response> => {
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

    const { id: feedbackId } = await context.params;

    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      select: { id: true },
    });

    if (!feedback) {
      return errorResponse('FEEDBACK_NOT_FOUND', 404);
    }

    const body = (await request.json()) as { content?: string };

    if (!body.content?.trim()) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const comment = await prisma.feedbackComment.create({
      data: {
        feedbackId,
        userId: session.user.id,
        content: body.content.trim(),
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { id: true, nickname: true } },
      },
    });

    const serialized = {
      ...comment,
      createdAt: new Date(comment.createdAt).toISOString(),
    };

    return successResponse(serialized, '댓글이 등록되었습니다.', 201);
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
