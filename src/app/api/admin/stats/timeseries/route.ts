import { type NextRequest, type NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-guard';
import { getDailyTimeseries, type TimeseriesPoint } from '@/lib/admin/stats';
import { errorResponse, successResponse } from '@/lib/api';
import { type ApiResponse } from '@/types/api';

export const GET = async (
  request: NextRequest,
): Promise<NextResponse<ApiResponse<TimeseriesPoint[] | null>>> => {
  const guard = await requireAdmin();

  if (!guard.ok) {
    return guard.response;
  }

  const { searchParams } = new URL(request.url);
  const daysParam = searchParams.get('days');
  const parsedDays = daysParam ? Number(daysParam) : 30;
  const days = Number.isFinite(parsedDays) && parsedDays > 0 && parsedDays <= 90 ? parsedDays : 30;

  try {
    const data = await getDailyTimeseries(days);

    return successResponse(data, 'OK');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
