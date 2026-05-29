import { type ReportStatus, type ReportTargetType } from '@prisma/client';
import { type NextRequest, type NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-guard';
import { getAdminReports, type AdminReportListItem } from '@/lib/admin/reports';
import { errorResponse, successResponse } from '@/lib/api';
import { type ApiResponse } from '@/types/api';

const VALID_STATUSES: ReportStatus[] = ['PENDING', 'DISMISSED', 'ACTIONED'];
const VALID_TARGET_TYPES: ReportTargetType[] = ['FEEDBACK', 'COMMENT'];

export const GET = async (
  request: NextRequest,
): Promise<NextResponse<ApiResponse<AdminReportListItem[] | null>>> => {
  const guard = await requireAdmin();

  if (!guard.ok) {
    return guard.response;
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status') as ReportStatus | null;
  const targetTypeParam = searchParams.get('targetType') as ReportTargetType | null;

  const status = statusParam && VALID_STATUSES.includes(statusParam) ? statusParam : undefined;
  const targetType =
    targetTypeParam && VALID_TARGET_TYPES.includes(targetTypeParam) ? targetTypeParam : undefined;

  try {
    const reports = await getAdminReports({ status, targetType });

    return successResponse(reports, 'OK');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
