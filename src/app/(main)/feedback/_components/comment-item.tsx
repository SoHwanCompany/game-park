'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { type FeedbackCommentItem } from '@/types/feedback';
import { Button } from '@/components/ui/button';

import { ReportButton } from './report-button';

interface CommentItemProps {
  comment: FeedbackCommentItem;
  feedbackId: string;
  currentUserId?: string;
}

const AVATAR_COLORS = [
  'bg-primary/15 text-primary',
  'bg-destructive/15 text-destructive',
  'bg-ring/15 text-ring',
  'bg-accent-foreground/10 text-accent-foreground',
  'bg-secondary-foreground/10 text-secondary-foreground',
] as const;

const getAvatarColor = (nickname: string): string => {
  let hash = 0;

  for (let i = 0; i < nickname.length; i++) {
    hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % AVATAR_COLORS.length;

  return AVATAR_COLORS[index];
};

const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) {
    return '방금 전';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  if (diffDays < 7) {
    return `${diffDays}일 전`;
  }

  if (diffWeeks < 5) {
    return `${diffWeeks}주 전`;
  }

  if (diffMonths < 12) {
    return `${diffMonths}개월 전`;
  }

  return `${Math.floor(diffDays / 365)}년 전`;
};

export const CommentItem = ({ comment, feedbackId, currentUserId }: CommentItemProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUserId === comment.user.id;

  const date = new Date(comment.createdAt).toLocaleDateString('ko-KR');
  const relativeTime = getRelativeTime(comment.createdAt);
  const initial = comment.user.nickname.charAt(0).toUpperCase();
  const avatarColor = getAvatarColor(comment.user.nickname);

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
    <div className="group flex gap-3 py-4 first:pt-0 last:pb-0">
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
          avatarColor,
        )}
      >
        {initial}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-medium">{comment.user.nickname}</span>
            <span className="text-muted-foreground" aria-hidden="true">
              ·
            </span>
            <time className="text-muted-foreground text-xs" dateTime={comment.createdAt}>
              {date}
            </time>
            <span className="text-muted-foreground" aria-hidden="true">
              ·
            </span>
            <span className="text-muted-foreground text-xs">{relativeTime}</span>
          </div>

          {isOwner ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-muted-foreground hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100"
            >
              {isDeleting ? '삭제 중' : '삭제'}
            </Button>
          ) : null}

          {!isOwner && currentUserId ? (
            <div className="opacity-0 transition-opacity group-hover:opacity-100">
              <ReportButton targetType="COMMENT" targetId={comment.id} />
            </div>
          ) : null}
        </div>

        <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  );
};
