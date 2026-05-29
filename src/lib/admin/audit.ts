import { type AdminAction, type Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export const recordAdminAction = async (
  actorId: string,
  action: AdminAction,
  targetId: string | null,
  payload?: Prisma.InputJsonValue,
): Promise<void> => {
  await prisma.adminAuditLog.create({
    data: {
      actorId,
      action,
      targetId,
      ...(payload !== undefined ? { payload } : {}),
    },
  });
};
