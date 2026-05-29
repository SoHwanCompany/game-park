'use client';

import { useState } from 'react';

import { type FeedbackStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const STATUS_OPTIONS: Array<{ value: FeedbackStatus; label: string }> = [
  { value: 'PENDING', label: '대기' },
  { value: 'CONFIRMED', label: '확인' },
  { value: 'IN_REVIEW', label: '검토 중' },
  { value: 'RESOLVED', label: '해결' },
  { value: 'DEFERRED', label: '보류' },
];

interface FeedbackStatusFormProps {
  feedbackId: string;
  currentStatus: FeedbackStatus;
}

export const FeedbackStatusForm = ({ feedbackId, currentStatus }: FeedbackStatusFormProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<FeedbackStatus>(currentStatus);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (status === currentStatus) {
      setError('변경할 상태를 선택해주세요.');

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comment: comment.trim() || null }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;

        setError(payload?.message ?? '상태 변경에 실패했습니다.');
        setIsSubmitting(false);

        return;
      }

      setComment('');
      router.refresh();
    } catch (caught) {
      console.error(caught);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-3">
        <Label htmlFor="feedback-status">상태 변경</Label>
        <select
          id="feedback-status"
          value={status}
          onChange={(event) => setStatus(event.target.value as FeedbackStatus)}
          className="bg-background h-9 rounded-md border px-3 text-sm"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedback-status-comment">변경 사유 (선택)</Label>
        <Textarea
          id="feedback-status-comment"
          rows={2}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="상태 변경 로그에 함께 기록됩니다."
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button type="submit" size="sm" disabled={isSubmitting || status === currentStatus}>
        상태 적용
      </Button>
    </form>
  );
};
