import { type NextRequest } from 'next/server';

import { errorResponse, successResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string; commentId: string }>;
}

export const DELETE = async (_request: NextRequest, context: RouteContext): Promise<Response> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 401);
    }

    const { commentId } = await context.params;

    const comment = await prisma.feedbackComment.findUnique({
      where: { id: commentId },
      select: { userId: true },
    });

    if (!comment) {
      return errorResponse('COMMENT_NOT_FOUND', 404);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (comment.userId !== session.user.id && user?.role !== 'ADMIN') {
      return errorResponse('FORBIDDEN', 403);
    }

    await prisma.feedbackComment.delete({ where: { id: commentId } });

    return successResponse(null, '댓글이 삭제되었습니다.');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
