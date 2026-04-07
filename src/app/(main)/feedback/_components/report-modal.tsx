'use client';

import { useState } from 'react';

import { type ReportReason, type ReportTargetType } from '@prisma/client';
import { AlertDialog } from 'radix-ui';

import { cn } from '@/lib/utils';
import { REPORT_REASONS } from '@/constants/feedback';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: ReportTargetType;
  targetId: string;
}

export const ReportModal = ({ open, onOpenChange, targetType, targetId }: ReportModalProps) => {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<'success' | 'already' | null>(null);

  const handleSubmit = async (): Promise<void> => {
    if (!reason) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          detail: detail.trim() || undefined,
        }),
      });

      if (response.ok) {
        setResult('success');
      } else if (response.status === 409) {
        setResult('already');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (): void => {
    onOpenChange(false);
    setReason(null);
    setDetail('');
    setResult(null);
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/40',
            'data-[state=open]:animate-[modal-overlay-in_150ms_ease-out]',
            'data-[state=closed]:animate-[modal-overlay-out_150ms_ease-in]',
          )}
        />
        <AlertDialog.Content
          className={cn(
            'bg-background fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-lg',
            'data-[state=open]:animate-[modal-content-in_150ms_ease-out]',
            'data-[state=closed]:animate-[modal-content-out_150ms_ease-in]',
          )}
        >
          {result ? (
            <>
              <AlertDialog.Title className="text-lg font-semibold">
                {result === 'success' ? '신고 완료' : '이미 신고됨'}
              </AlertDialog.Title>
              <AlertDialog.Description className="text-muted-foreground mt-2 text-sm">
                {result === 'success'
                  ? '신고가 접수되었습니다. 검토 후 처리하겠습니다.'
                  : '이미 신고한 게시글입니다.'}
              </AlertDialog.Description>
              <div className="mt-6 flex justify-end">
                <AlertDialog.Action asChild onClick={handleClose}>
                  <Button size="sm">확인</Button>
                </AlertDialog.Action>
              </div>
            </>
          ) : (
            <>
              <AlertDialog.Title className="text-lg font-semibold">신고하기</AlertDialog.Title>
              <AlertDialog.Description className="text-muted-foreground mt-2 text-sm">
                신고 사유를 선택해주세요.
              </AlertDialog.Description>

              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r.value}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                        reason === r.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-accent',
                      )}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value as ReportReason)}
                        className="accent-primary"
                      />
                      {r.label}
                    </label>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-detail" className="text-xs">
                    추가 설명 (선택)
                  </Label>
                  <Textarea
                    id="report-detail"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    placeholder="자세한 내용을 알려주시면 빠르게 처리할 수 있어요"
                    rows={3}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <AlertDialog.Cancel asChild>
                  <Button variant="outline" size="sm" onClick={handleClose}>
                    취소
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild onClick={handleSubmit}>
                  <Button size="sm" disabled={!reason || isSubmitting}>
                    {isSubmitting ? '접수 중...' : '신고하기'}
                  </Button>
                </AlertDialog.Action>
              </div>
            </>
          )}
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
