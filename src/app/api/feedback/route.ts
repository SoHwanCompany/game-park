import { type FeedbackCategory } from '@prisma/client';
import { type NextRequest } from 'next/server';

import { errorResponse, successResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FEEDBACK_PAGE_SIZE } from '@/constants/feedback';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');
    const gameId = searchParams.get('gameId');
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

    const session = await auth();
    const currentUserId = session?.user?.id;

    const where = {
      ...(category && category !== 'all' ? { category: category as FeedbackCategory } : {}),
      ...(gameId ? { gameId } : {}),
      OR: [{ isPublic: true }, ...(currentUserId ? [{ userId: currentUserId }] : [])],
    };

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * FEEDBACK_PAGE_SIZE,
        take: FEEDBACK_PAGE_SIZE,
        select: {
          id: true,
          title: true,
          category: true,
          customCategory: true,
          status: true,
          isPublic: true,
          createdAt: true,
          user: { select: { nickname: true } },
          game: { select: { title: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.feedback.count({ where }),
    ]);

    const serialized = feedbacks.map((f) => ({
      ...f,
      createdAt: new Date(f.createdAt).toISOString(),
    }));

    return successResponse(
      { feedbacks: serialized, total, page, totalPages: Math.ceil(total / FEEDBACK_PAGE_SIZE) },
      '의견 목록을 조회했습니다.',
    );
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};

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
      title?: string;
      content?: string;
      category?: FeedbackCategory;
      customCategory?: string;
      gameId?: string;
      isPublic?: boolean;
    };

    const { title, content, category, customCategory, gameId, isPublic } = body;

    if (!title?.trim() || !content?.trim()) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        content: content.trim(),
        category: category ?? 'GENERAL',
        customCategory: category === 'OTHER' ? customCategory?.trim() : null,
        gameId: gameId ?? null,
        isPublic: isPublic ?? true,
      },
      select: { id: true },
    });

    return successResponse(feedback, '의견이 등록되었습니다.', 201);
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
