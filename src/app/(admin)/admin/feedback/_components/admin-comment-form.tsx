'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AdminCommentFormProps {
  feedbackId: string;
}

export const AdminCommentForm = ({ feedbackId }: AdminCommentFormProps) => {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);

    const trimmed = content.trim();

    if (!trimmed) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;

        setError(payload?.message ?? '댓글 작성에 실패했습니다.');
        setIsSubmitting(false);

        return;
      }

      setContent('');
      router.refresh();
    } catch (caught) {
      console.error(caught);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Label htmlFor="admin-comment">운영자 댓글</Label>
      <Textarea
        id="admin-comment"
        rows={3}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="작성자에게 보일 답변을 입력하세요."
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isSubmitting || !content.trim()}>
          댓글 작성
        </Button>
      </div>
    </form>
  );
};
