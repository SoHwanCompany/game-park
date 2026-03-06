'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { type FeedbackCommentItem } from '@/types/feedback';
import { Button } from '@/components/ui/button';

import { CommentItem } from './comment-item';

interface CommentSectionProps {
  feedbackId: string;
  comments: FeedbackCommentItem[];
  currentUserId?: string;
}

export const CommentSection = ({ feedbackId, comments, currentUserId }: CommentSectionProps) => {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/feedback/${feedbackId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (response.ok) {
        setContent('');
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-t pt-6">
      <h2 className="mb-4 text-lg font-semibold">댓글 {comments.length}</h2>

      {comments.length > 0 ? (
        <div className="mb-6 space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              feedbackId={feedbackId}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground mb-6 text-sm">아직 댓글이 없습니다.</p>
      )}

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 입력해주세요"
            rows={2}
            className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex-1 rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          />
          <Button type="submit" disabled={isSubmitting || !content.trim()} className="self-end">
            {isSubmitting ? '등록 중...' : '등록'}
          </Button>
        </form>
      ) : (
        <p className="text-muted-foreground text-sm">댓글을 작성하려면 로그인이 필요합니다.</p>
      )}
    </div>
  );
};
