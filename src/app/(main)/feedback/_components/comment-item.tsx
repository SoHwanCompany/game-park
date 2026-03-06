'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { type FeedbackCommentItem } from '@/types/feedback';
import { Button } from '@/components/ui/button';

interface CommentItemProps {
  comment: FeedbackCommentItem;
  feedbackId: string;
  currentUserId?: string;
}

export const CommentItem = ({ comment, feedbackId, currentUserId }: CommentItemProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUserId === comment.user.id;

  const date = new Date(comment.createdAt).toLocaleDateString('ko-KR');

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/feedback/${feedbackId}/comments/${comment.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{comment.user.nickname}</span>
          <span className="text-muted-foreground text-xs">{date}</span>
        </div>

        {isOwner ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-muted-foreground h-auto px-2 py-1 text-xs"
          >
            삭제
          </Button>
        ) : null}
      </div>

      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
    </div>
  );
};
