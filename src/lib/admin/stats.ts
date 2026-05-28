import { prisma } from '@/lib/prisma';

export interface AdminOverview {
  totalUsers: number;
  newUsersToday: number;
  newLikesToday: number;
  pendingFeedbacks: number;
  pendingReports: number;
}

const getStartOfToday = (): Date => {
  const now = new Date();

  now.setHours(0, 0, 0, 0);

  return now;
};

export const getAdminOverview = async (): Promise<AdminOverview> => {
  const startOfToday = getStartOfToday();

  const [totalUsers, newUsersToday, newLikesToday, pendingFeedbacks, pendingReports] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.gameLike.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.feedback.count({ where: { status: 'PENDING' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

  return { totalUsers, newUsersToday, newLikesToday, pendingFeedbacks, pendingReports };
};
