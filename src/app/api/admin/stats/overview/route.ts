import { type NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-guard';
import { getAdminOverview, type AdminOverview } from '@/lib/admin/stats';
import { errorResponse, successResponse } from '@/lib/api';
import { type ApiResponse } from '@/types/api';

export const GET = async (): Promise<NextResponse<ApiResponse<AdminOverview | null>>> => {
  const guard = await requireAdmin();

  if (!guard.ok) {
    return guard.response;
  }

  try {
    const overview = await getAdminOverview();

    return successResponse(overview, 'OK');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
