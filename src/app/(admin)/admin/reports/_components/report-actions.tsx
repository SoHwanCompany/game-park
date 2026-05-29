'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface ReportActionsProps {
  reportId: string;
  targetSummary: string;
  isHidden: boolean;
  disabled: boolean;
}

export const ReportActions = ({
  reportId,
  targetSummary,
  isHidden,
  disabled,
}: ReportActionsProps) => {
  const router = useRouter();
  const [pending, setPending] = useState<'dismiss' | 'hide' | null>(null);
  const [hideOpen, setHideOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callPatch = async (action: 'dismiss' | 'hide-target'): Promise<void> => {
    setError(null);
    setPending(action === 'dismiss' ? 'dismiss' : 'hide');

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;

        setError(payload?.message ?? '처리에 실패했습니다.');

        return;
      }

      router.refresh();
    } catch (caught) {
      console.error(caught);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled || pending !== null}
          onClick={() => callPatch('dismiss')}
        >
          유지
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={disabled || pending !== null || isHidden}
          onClick={() => setHideOpen(true)}
        >
          {isHidden ? '이미 숨김' : '대상 숨김'}
        </Button>
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
      <Modal
        open={hideOpen}
        onOpenChange={setHideOpen}
        title="대상을 숨기시겠습니까?"
        description={`"${targetSummary}" 대상을 비공개 처리합니다. 같은 대상에 대한 다른 미처리 신고도 함께 조치 완료 상태로 변경됩니다.`}
        variant="confirm"
        confirmLabel="숨김 처리"
        onConfirm={() => {
          void callPatch('hide-target');
        }}
      />
    </div>
  );
};
