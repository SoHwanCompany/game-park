import { errorResponse, successResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const DELETE = async (): Promise<Response> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 401);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { status: 'WITHDRAWN' },
      }),
      prisma.account.deleteMany({
        where: { userId: session.user.id },
      }),
    ]);

    return successResponse(null, '회원 탈퇴가 완료되었습니다.');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
