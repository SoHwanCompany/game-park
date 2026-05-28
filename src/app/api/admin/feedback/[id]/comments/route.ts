import { type NextRequest, type NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/admin-guard';
import { errorResponse, successResponse } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { type ApiResponse } from '@/types/api';

const bodySchema = z.object({
  content: z.string().min(1).max(2000),
});

export const POST = async (
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

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!feedback) {
      return errorResponse('FEEDBACK_NOT_FOUND', 404);
    }

    const created = await prisma.feedbackComment.create({
      data: {
        feedbackId: id,
        userId: guard.userId,
        content: parsed.data.content,
      },
      select: { id: true },
    });

    return successResponse(created, '댓글이 등록되었습니다.', 201);
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
