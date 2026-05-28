import { type UserRole, type UserStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';

interface GetAdminUsersParams {
  q?: string;
  status?: UserStatus;
  role?: UserRole;
  limit?: number;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  status: UserStatus;
  exp: number;
  createdAt: Date;
}

export const getAdminUsers = async ({
  q,
  status,
  role,
  limit = 50,
}: GetAdminUsersParams = {}): Promise<AdminUserListItem[]> => {
  return prisma.user.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(role ? { role } : {}),
      ...(q
        ? {
            OR: [
              { nickname: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      email: true,
      nickname: true,
      role: true,
      status: true,
      exp: true,
      createdAt: true,
    },
  });
};

interface AdminUserDetail {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  status: UserStatus;
  exp: number;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  activity: {
    playedGames: number;
    likedGames: number;
    feedbacks: number;
    comments: number;
  };
}

export const getAdminUserById = async (id: string): Promise<AdminUserDetail | null> => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      nickname: true,
      role: true,
      status: true,
      exp: true,
      emailVerifiedAt: true,
      createdAt: true,
      _count: {
        select: {
          rankings: true,
          gameLikes: true,
          feedbacks: true,
          feedbackComments: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const { _count, ...rest } = user;

  return {
    ...rest,
    activity: {
      playedGames: _count.rankings,
      likedGames: _count.gameLikes,
      feedbacks: _count.feedbacks,
      comments: _count.feedbackComments,
    },
  };
};
