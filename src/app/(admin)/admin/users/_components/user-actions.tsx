'use client';

import { useState } from 'react';

import { type UserRole, type UserStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserActionsProps {
  userId: string;
  initialStatus: UserStatus;
  initialRole: UserRole;
  initialNickname: string;
  isSelf: boolean;
}

export const UserActions = ({
  userId,
  initialStatus,
  initialRole,
  initialNickname,
  isSelf,
}: UserActionsProps) => {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [role, setRole] = useState(initialRole);
  const [nickname, setNickname] = useState(initialNickname);
  const [error, setError] = useState<string | null>(null);
  const [pendingField, setPendingField] = useState<'status' | 'role' | 'nickname' | null>(null);

  const callPatch = async (
    field: 'status' | 'role' | 'nickname',
    body: Record<string, unknown>,
  ): Promise<boolean> => {
    setError(null);
    setPendingField(field);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;

        setError(payload?.message ?? '요청에 실패했습니다.');

        return false;
      }

      router.refresh();

      return true;
    } catch (caught) {
      console.error(caught);
      setError('네트워크 오류가 발생했습니다.');

      return false;
    } finally {
      setPendingField(null);
    }
  };

  const handleStatusToggle = async (): Promise<void> => {
    const nextStatus: UserStatus = status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const ok = await callPatch('status', { status: nextStatus });

    if (ok) {
      setStatus(nextStatus);
    }
  };

  const handleRoleToggle = async (): Promise<void> => {
    const nextRole: UserRole = role === 'ADMIN' ? 'USER' : 'ADMIN';
    const ok = await callPatch('role', { role: nextRole });

    if (ok) {
      setRole(nextRole);
    }
  };

  const handleNicknameSave = async (): Promise<void> => {
    if (!nickname.trim() || nickname === initialNickname) {
      return;
    }

    await callPatch('nickname', { nickname: nickname.trim() });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">계정 상태</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm tabular-nums">현재: {status}</span>
          <Button
            type="button"
            variant={status === 'ACTIVE' ? 'destructive' : 'default'}
            size="sm"
            disabled={isSelf || pendingField === 'status' || status === 'WITHDRAWN'}
            onClick={handleStatusToggle}
          >
            {status === 'ACTIVE' ? '정지' : '활성화'}
          </Button>
        </div>
        {isSelf && <p className="text-muted-foreground text-xs">본인 상태는 변경할 수 없습니다.</p>}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">권한</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm tabular-nums">현재: {role}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSelf || pendingField === 'role'}
            onClick={handleRoleToggle}
          >
            {role === 'ADMIN' ? 'USER로 강등' : 'ADMIN으로 승격'}
          </Button>
        </div>
        {isSelf && <p className="text-muted-foreground text-xs">본인 권한은 변경할 수 없습니다.</p>}
      </section>

      <section className="space-y-2">
        <Label htmlFor="nickname">닉네임</Label>
        <div className="flex max-w-md gap-2">
          <Input
            id="nickname"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={50}
          />
          <Button
            type="button"
            size="sm"
            disabled={
              pendingField === 'nickname' || !nickname.trim() || nickname === initialNickname
            }
            onClick={handleNicknameSave}
          >
            저장
          </Button>
        </div>
      </section>

      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
};
