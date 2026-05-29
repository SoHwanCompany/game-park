import { type NextResponse } from 'next/server';

import { errorResponse } from '@/lib/api';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { type ApiResponse } from '@/types/api';

type AdminGuardResult =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse<ApiResponse<null>> };

export const requireAdmin = async (): Promise<AdminGuardResult> => {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, response: errorResponse('UNAUTHORIZED', 401) };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true },
  });

  if (!user || user.status !== 'ACTIVE' || user.role !== 'ADMIN') {
    return { ok: false, response: errorResponse('FORBIDDEN', 403) };
  }

  return { ok: true, userId: session.user.id };
};
