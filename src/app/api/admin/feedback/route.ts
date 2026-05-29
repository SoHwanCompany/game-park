import { type FeedbackCategory, type FeedbackStatus } from '@prisma/client';
import { type NextRequest, type NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-guard';
import { getAdminFeedbacks, type AdminFeedbackListItem } from '@/lib/admin/feedbacks';
import { errorResponse, successResponse } from '@/lib/api';
import { type ApiResponse } from '@/types/api';

const VALID_STATUSES: FeedbackStatus[] = [
  'PENDING',
  'CONFIRMED',
  'IN_REVIEW',
  'RESOLVED',
  'DEFERRED',
];
const VALID_CATEGORIES: FeedbackCategory[] = ['BUG', 'FEATURE', 'GENERAL', 'GAME_REQUEST', 'OTHER'];

export const GET = async (
  request: NextRequest,
): Promise<NextResponse<ApiResponse<AdminFeedbackListItem[] | null>>> => {
  const guard = await requireAdmin();

  if (!guard.ok) {
    return guard.response;
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? undefined;
  const statusParam = searchParams.get('status') as FeedbackStatus | null;
  const categoryParam = searchParams.get('category') as FeedbackCategory | null;

  const status = statusParam && VALID_STATUSES.includes(statusParam) ? statusParam : undefined;
  const category =
    categoryParam && VALID_CATEGORIES.includes(categoryParam) ? categoryParam : undefined;

  try {
    const feedbacks = await getAdminFeedbacks({ q, status, category });

    return successResponse(feedbacks, 'OK');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
