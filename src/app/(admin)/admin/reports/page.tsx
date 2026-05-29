import { type ReportReason, type ReportStatus, type ReportTargetType } from '@prisma/client';

import { getAdminReports } from '@/lib/admin/reports';
import { Badge } from '@/components/ui/badge';

import { ReportActions } from './_components/report-actions';
import { ReportFilters } from './_components/report-filters';

const STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: '미처리',
  DISMISSED: '유지',
  ACTIONED: '조치됨',
};

const STATUS_VARIANT: Record<ReportStatus, 'default' | 'secondary' | 'destructive'> = {
  PENDING: 'destructive',
  DISMISSED: 'secondary',
  ACTIONED: 'default',
};

const REASON_LABEL: Record<ReportReason, string> = {
  PROFANITY: '욕설',
  SPAM: '스팸',
  INAPPROPRIATE: '부적절',
  OTHER: '기타',
};

const VALID_STATUSES: ReportStatus[] = ['PENDING', 'DISMISSED', 'ACTIONED'];
const VALID_TARGET_TYPES: ReportTargetType[] = ['FEEDBACK', 'COMMENT'];

const resolveStatusParam = (param: string | undefined): ReportStatus | undefined => {
  if (param === undefined) {
    return 'PENDING';
  }

  if (param === '' || !VALID_STATUSES.includes(param as ReportStatus)) {
    return undefined;
  }

  return param as ReportStatus;
};

interface AdminReportsPageProps {
  searchParams: Promise<{ status?: string; targetType?: string }>;
}

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  const sp = await searchParams;
  const status = resolveStatusParam(sp.status);
  const targetType =
    sp.targetType && VALID_TARGET_TYPES.includes(sp.targetType as ReportTargetType)
      ? (sp.targetType as ReportTargetType)
      : undefined;

  const reports = await getAdminReports({ status, targetType });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">신고 처리</h2>
      <ReportFilters />

      <div className="bg-card overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr className="text-muted-foreground text-left text-xs font-medium">
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">대상</th>
              <th className="px-4 py-3">미리보기</th>
              <th className="px-4 py-3">사유</th>
              <th className="px-4 py-3">신고자</th>
              <th className="px-4 py-3 text-right">누적</th>
              <th className="px-4 py-3">시각</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-muted-foreground px-4 py-8 text-center">
                  조건에 맞는 신고가 없습니다.
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-4 py-2">
                    <Badge variant={STATUS_VARIANT[report.status]}>
                      {STATUS_LABEL[report.status]}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground px-4 py-2 text-xs">
                    {report.targetType === 'FEEDBACK' ? '피드백' : '댓글'}
                  </td>
                  <td className="text-muted-foreground max-w-md truncate px-4 py-2 text-xs">
                    {report.targetPreview?.summary ?? '(삭제됨)'}
                    {report.targetPreview?.isHidden && (
                      <Badge variant="secondary" className="ml-2">
                        숨김
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    <span>{REASON_LABEL[report.reason]}</span>
                    {report.detail && (
                      <span className="text-muted-foreground ml-1">· {report.detail}</span>
                    )}
                  </td>
                  <td className="text-muted-foreground px-4 py-2">{report.reporter.nickname}</td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {report.duplicateCount >= 5 ? (
                      <Badge variant="destructive">{report.duplicateCount}</Badge>
                    ) : (
                      <span className="text-muted-foreground">{report.duplicateCount}</span>
                    )}
                  </td>
                  <td className="text-muted-foreground px-4 py-2 text-xs">
                    {new Date(report.createdAt).toLocaleString('ko-KR')}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <ReportActions
                      reportId={report.id}
                      targetSummary={report.targetPreview?.summary ?? '(삭제됨)'}
                      isHidden={report.targetPreview?.isHidden ?? false}
                      disabled={report.status !== 'PENDING'}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
