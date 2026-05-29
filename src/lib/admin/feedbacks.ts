import { type FeedbackCategory, type FeedbackStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';

interface GetAdminFeedbacksParams {
  status?: FeedbackStatus;
  category?: FeedbackCategory;
  q?: string;
  limit?: number;
}

export interface AdminFeedbackListItem {
  id: string;
  title: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  isPublic: boolean;
  createdAt: Date;
  user: { id: string; nickname: string };
  game: { id: string; title: string } | null;
}

export const getAdminFeedbacks = async ({
  status,
  category,
  q,
  limit = 50,
}: GetAdminFeedbacksParams = {}): Promise<AdminFeedbackListItem[]> => {
  return prisma.feedback.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: limit,
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      isPublic: true,
      createdAt: true,
      user: { select: { id: true, nickname: true } },
      game: { select: { id: true, title: true } },
    },
  });
};

interface AdminFeedbackDetail {
  id: string;
  title: string;
  content: string;
  category: FeedbackCategory;
  customCategory: string | null;
  status: FeedbackStatus;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; nickname: string; email: string };
  game: { id: string; title: string } | null;
  statusLogs: Array<{
    id: string;
    status: FeedbackStatus;
    comment: string | null;
    createdAt: Date;
    user: { id: string; nickname: string };
  }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    deletedAt: Date | null;
    user: { id: string; nickname: string; role: 'USER' | 'ADMIN' };
  }>;
}

export const getAdminFeedbackById = async (id: string): Promise<AdminFeedbackDetail | null> => {
  return prisma.feedback.findUnique({
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
      updatedAt: true,
      user: { select: { id: true, nickname: true, email: true } },
      game: { select: { id: true, title: true } },
      statusLogs: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          comment: true,
          createdAt: true,
          user: { select: { id: true, nickname: true } },
        },
      },
      comments: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          content: true,
          createdAt: true,
          deletedAt: true,
          user: { select: { id: true, nickname: true, role: true } },
        },
      },
    },
  });
};
