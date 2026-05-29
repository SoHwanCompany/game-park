'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';

interface ResetLeaderboardFormProps {
  gameId: string;
  gameTitle: string;
}

export const ResetLeaderboardForm = ({ gameId, gameTitle }: ResetLeaderboardFormProps) => {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = (): void => {
    setError(null);

    if (!reason.trim()) {
      setError('리셋 사유를 입력해주세요.');

      return;
    }

    setOpen(true);
  };

  const handleConfirm = async (): Promise<void> => {
    setIsResetting(true);

    try {
      const response = await fetch(`/api/admin/rankings/${gameId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;

        setError(payload?.message ?? '리셋에 실패했습니다.');
        setIsResetting(false);

        return;
      }

      setReason('');
      router.refresh();
    } catch (caught) {
      console.error(caught);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="reset-reason">리셋 사유</Label>
      <Textarea
        id="reset-reason"
        rows={2}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="예: 주간 토너먼트 종료 / 부정 행위 다수 발견"
        className="max-w-2xl"
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={handleStart}
        disabled={isResetting}
      >
        전체 랭킹 리셋
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="정말로 전체 랭킹을 리셋합니까?"
        description={`"${gameTitle}"의 모든 랭킹 기록이 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`}
        variant="confirm"
        confirmLabel="리셋 실행"
        onConfirm={handleConfirm}
      />
    </div>
  );
};
