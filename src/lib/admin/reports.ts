import { type ReportReason, type ReportStatus, type ReportTargetType } from '@prisma/client';

import { prisma } from '@/lib/prisma';

interface GetAdminReportsParams {
  status?: ReportStatus;
  targetType?: ReportTargetType;
  limit?: number;
}

export interface AdminReportListItem {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  detail: string | null;
  status: ReportStatus;
  createdAt: Date;
  reporter: { id: string; nickname: string };
  targetPreview: {
    summary: string;
    isHidden: boolean;
  } | null;
  duplicateCount: number;
}

export const getAdminReports = async ({
  status,
  targetType,
  limit = 100,
}: GetAdminReportsParams = {}): Promise<AdminReportListItem[]> => {
  const reports = await prisma.report.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(targetType ? { targetType } : {}),
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: limit,
    select: {
      id: true,
      targetType: true,
      targetId: true,
      reason: true,
      detail: true,
      status: true,
      createdAt: true,
      reporter: { select: { id: true, nickname: true } },
    },
  });

  const feedbackIds = reports
    .filter((report) => report.targetType === 'FEEDBACK')
    .map((report) => report.targetId);
  const commentIds = reports
    .filter((report) => report.targetType === 'COMMENT')
    .map((report) => report.targetId);

  const [feedbackTargets, commentTargets, pendingGroups] = await Promise.all([
    feedbackIds.length > 0
      ? prisma.feedback.findMany({
          where: { id: { in: feedbackIds } },
          select: { id: true, title: true, content: true, isPublic: true },
        })
      : Promise.resolve([]),
    commentIds.length > 0
      ? prisma.feedbackComment.findMany({
          where: { id: { in: commentIds } },
          select: { id: true, content: true, deletedAt: true },
        })
      : Promise.resolve([]),
    prisma.report.groupBy({
      by: ['targetType', 'targetId'],
      where: { status: 'PENDING' },
      _count: { id: true },
    }),
  ]);

  const feedbackMap = new Map(feedbackTargets.map((target) => [target.id, target]));
  const commentMap = new Map(commentTargets.map((target) => [target.id, target]));
  const countMap = new Map(
    pendingGroups.map((row) => [`${row.targetType}:${row.targetId}`, row._count.id]),
  );

  return reports.map((report) => {
    let targetPreview: AdminReportListItem['targetPreview'] = null;

    if (report.targetType === 'FEEDBACK') {
      const target = feedbackMap.get(report.targetId);

      if (target) {
        targetPreview = {
          summary: target.title,
          isHidden: !target.isPublic,
        };
      }
    } else {
      const target = commentMap.get(report.targetId);

      if (target) {
        targetPreview = {
          summary: target.content.slice(0, 60),
          isHidden: target.deletedAt !== null,
        };
      }
    }

    return {
      id: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      detail: report.detail,
      status: report.status,
      createdAt: report.createdAt,
      reporter: report.reporter,
      targetPreview,
      duplicateCount: countMap.get(`${report.targetType}:${report.targetId}`) ?? 0,
    };
  });
};
