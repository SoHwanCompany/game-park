import { type UserRole, type UserStatus } from '@prisma/client';
import { type NextRequest, type NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-guard';
import { getAdminUsers, type AdminUserListItem } from '@/lib/admin/users';
import { errorResponse, successResponse } from '@/lib/api';
import { type ApiResponse } from '@/types/api';

const VALID_STATUSES: UserStatus[] = ['ACTIVE', 'SUSPENDED', 'WITHDRAWN'];
const VALID_ROLES: UserRole[] = ['USER', 'ADMIN'];

export const GET = async (
  request: NextRequest,
): Promise<NextResponse<ApiResponse<AdminUserListItem[] | null>>> => {
  const guard = await requireAdmin();

  if (!guard.ok) {
    return guard.response;
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? undefined;
  const statusParam = searchParams.get('status') as UserStatus | null;
  const roleParam = searchParams.get('role') as UserRole | null;

  const status = statusParam && VALID_STATUSES.includes(statusParam) ? statusParam : undefined;
  const role = roleParam && VALID_ROLES.includes(roleParam) ? roleParam : undefined;

  try {
    const users = await getAdminUsers({ q, status, role });

    return successResponse(users, 'OK');
  } catch {
    return errorResponse('INTERNAL_ERROR', 500);
  }
};
