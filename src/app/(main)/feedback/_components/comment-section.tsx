'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { type FeedbackCommentItem } from '@/types/feedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

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
    <section className="mt-8 space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">댓글</h2>
        <Badge variant="secondary" className="tabular-nums">
          {comments.length}
        </Badge>
      </div>

      <Separator />

      {comments.length > 0 ? (
        <div className="divide-border space-y-0 divide-y">
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
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-muted-foreground text-sm">아직 댓글이 없습니다.</p>
          <p className="text-muted-foreground mt-1 text-xs">첫 번째 댓글을 남겨보세요.</p>
        </div>
      )}

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 입력해주세요"
            rows={3}
          />

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isSubmitting || !content.trim()}>
              {isSubmitting ? '등록 중...' : '등록'}
            </Button>
          </div>
        </form>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-between py-4">
            <p className="text-muted-foreground text-sm">댓글을 작성하려면 로그인이 필요합니다.</p>

            <Link href="/login">
              <Button variant="outline" size="sm">
                로그인
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </section>
  );
};
