import { type UserRole, type UserStatus } from '@prisma/client';
import Link from 'next/link';

import { getAdminUsers } from '@/lib/admin/users';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { UserFilters } from './_components/user-filters';

const STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: '활성',
  SUSPENDED: '정지',
  WITHDRAWN: '탈퇴',
};

const STATUS_VARIANT: Record<UserStatus, 'default' | 'destructive' | 'secondary'> = {
  ACTIVE: 'default',
  SUSPENDED: 'destructive',
  WITHDRAWN: 'secondary',
};

const VALID_STATUSES: UserStatus[] = ['ACTIVE', 'SUSPENDED', 'WITHDRAWN'];
const VALID_ROLES: UserRole[] = ['USER', 'ADMIN'];

interface AdminUsersPageProps {
  searchParams: Promise<{ q?: string; status?: string; role?: string }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const sp = await searchParams;
  const q = sp.q;
  const status =
    sp.status && VALID_STATUSES.includes(sp.status as UserStatus)
      ? (sp.status as UserStatus)
      : undefined;
  const role =
    sp.role && VALID_ROLES.includes(sp.role as UserRole) ? (sp.role as UserRole) : undefined;

  const users = await getAdminUsers({ q, status, role });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">유저 관리</h2>
      <UserFilters />

      <div className="bg-card overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr className="text-muted-foreground text-left text-xs font-medium">
              <th className="px-4 py-3">닉네임</th>
              <th className="px-4 py-3">이메일</th>
              <th className="px-4 py-3">권한</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3 text-right">EXP</th>
              <th className="px-4 py-3">가입일</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-muted-foreground px-4 py-8 text-center">
                  조건에 맞는 유저가 없습니다.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2 font-medium">{user.nickname}</td>
                  <td className="text-muted-foreground px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    {user.role === 'ADMIN' ? (
                      <Badge variant="outline">ADMIN</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">USER</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant={STATUS_VARIANT[user.status]}>{STATUS_LABEL[user.status]}</Badge>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{user.exp.toLocaleString()}</td>
                  <td className="text-muted-foreground px-4 py-2">
                    {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/users/${user.id}`}>상세</Link>
                    </Button>
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
