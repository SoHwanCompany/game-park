import { type NextRequest } from 'next/server';

import { errorResponse, successResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = async (_request: NextRequest, context: RouteContext): Promise<Response> => {
  try {
    const { id } = await context.params;
    const session = await auth();
    const currentUserId = session?.user?.id;

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        customCategory: true,
        status: true,
        isPublic: true,
        createdAt: true,
        user: { select: { id: true, nickname: true } },
        game: { select: { id: true, title: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: { select: { id: true, nickname: true } },
          },
        },
        statusLogs: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            status: true,
            comment: true,
            createdAt: true,
            user: { select: { nickname: true } },
          },
        },
      },
    });

    if (!feedback) {
      return errorResponse('FEEDBACK_NOT_FOUND', 404);
    }

    if (!feedback.isPublic) {
      const isOwner = currentUserId === feedback.user.id;
      const isAdmin = currentUserId
        ? (
            await prisma.user.findUnique({
              where: { id: currentUserId },
              select: { role: true },
            })
          )?.role === 'ADMIN'
        : false;

      if (!isOwner && !isAdmin) {
        return errorResponse('FEEDBACK_NOT_FOUND', 404);
      }
    }

    const serialized = {
      ...feedback,
      createdAt: new Date(feedback.createdAt).toISOString(),
      comments: feedback.comments.map((c) => ({
        ...c,
        createdAt: new Date(c.createdAt).toISOString(),
      })),
      statusLogs: feedback.statusLogs.map((l) => ({
        ...l,
        createdAt: new Date(l.createdAt).toISOString(),
      })),
    };

    return successResponse(serialized, '의견을 조회했습니다.');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};

export const DELETE = async (_request: NextRequest, context: RouteContext): Promise<Response> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 401);
    }

    const { id } = await context.params;

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!feedback) {
      return errorResponse('FEEDBACK_NOT_FOUND', 404);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (feedback.userId !== session.user.id && user?.role !== 'ADMIN') {
      return errorResponse('FORBIDDEN', 403);
    }

    await prisma.feedback.delete({ where: { id } });

    return successResponse(null, '의견이 삭제되었습니다.');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
