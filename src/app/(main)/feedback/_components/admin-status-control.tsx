'use client';

import { useState } from 'react';

import { type FeedbackStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { FEEDBACK_STATUSES } from '@/constants/feedback';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AdminStatusControlProps {
  feedbackId: string;
  currentStatus: FeedbackStatus;
}

export const AdminStatusControl = ({ feedbackId, currentStatus }: AdminStatusControlProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<FeedbackStatus>(currentStatus);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    if (status === currentStatus && !comment.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/feedback/${feedbackId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comment: comment.trim() || undefined }),
      });

      if (response.ok) {
        setComment('');
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="text-sm font-semibold">상태 변경 (관리자)</h3>

      <div className="flex flex-wrap gap-2">
        {FEEDBACK_STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setStatus(s.value as FeedbackStatus)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              status === s.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:bg-accent',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-comment" className="text-xs">
          코멘트 (선택)
        </Label>

        <Textarea
          id="admin-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="사용자에게 전달할 메시지를 입력하세요"
          rows={2}
          className="text-sm"
        />
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isSubmitting || (status === currentStatus && !comment.trim())}
        >
          {isSubmitting ? '변경 중...' : '상태 변경'}
        </Button>
      </div>
    </div>
  );
};
