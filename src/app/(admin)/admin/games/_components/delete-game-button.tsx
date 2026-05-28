'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface DeleteGameButtonProps {
  gameId: string;
  gameTitle: string;
}

export const DeleteGameButton = ({ gameId, gameTitle }: DeleteGameButtonProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (): Promise<void> => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/games/${gameId}`, { method: 'DELETE' });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;

        setError(payload?.message ?? '삭제에 실패했습니다.');
        setIsDeleting(false);

        return;
      }

      router.push('/admin/games');
      router.refresh();
    } catch (caught) {
      console.error(caught);
      setError('네트워크 오류가 발생했습니다.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="destructive"
        onClick={() => setOpen(true)}
        disabled={isDeleting}
      >
        게임 삭제
      </Button>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="게임을 삭제하시겠습니까?"
        description={`"${gameTitle}" 게임을 삭제합니다. 관련 좋아요·랭킹·피드백도 함께 삭제됩니다.`}
        variant="confirm"
        confirmLabel="삭제"
        onConfirm={handleConfirm}
      />
    </div>
  );
};
