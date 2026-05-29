'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface DeleteRankingRowButtonProps {
  gameId: string;
  userId: string;
  nickname: string;
  score: number;
}

export const DeleteRankingRowButton = ({
  gameId,
  userId,
  nickname,
  score,
}: DeleteRankingRowButtonProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (): Promise<void> => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/rankings/${gameId}/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;

        setError(payload?.message ?? '삭제에 실패했습니다.');
        setIsDeleting(false);

        return;
      }

      router.refresh();
    } catch (caught) {
      console.error(caught);
      setError('네트워크 오류가 발생했습니다.');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setOpen(true)}
        disabled={isDeleting}
      >
        삭제
      </Button>
      {error && <p className="text-destructive text-xs">{error}</p>}
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="이 랭킹을 삭제하시겠습니까?"
        description={`${nickname} · ${score.toLocaleString()}점 행이 삭제됩니다. 부정 점수 제거 시에만 사용하세요.`}
        variant="confirm"
        confirmLabel="삭제"
        onConfirm={handleConfirm}
      />
    </>
  );
};
