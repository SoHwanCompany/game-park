import { type NextRequest } from 'next/server';

import { errorResponse, successResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { profileUpdateSchema } from '@/app/(mypage)/mypage/_schemas/profile';

export const PUT = async (request: NextRequest): Promise<Response> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 401);
    }

    const body: unknown = await request.json();
    const result = profileUpdateSchema.safeParse(body);

    if (!result.success) {
      return errorResponse('VALIDATION_ERROR', 400);
    }

    const { nickname } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { nickname },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return errorResponse('NICKNAME_EXISTS', 409);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { nickname },
      select: {
        id: true,
        email: true,
        nickname: true,
      },
    });

    return successResponse(updatedUser, '프로필이 수정되었습니다.');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
