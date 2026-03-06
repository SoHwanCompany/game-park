'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { type FeedbackDetail } from '@/types/feedback';
import { FEEDBACK_CATEGORY_MAP } from '@/constants/feedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface FeedbackDetailViewProps {
  feedback: FeedbackDetail;
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

export const FeedbackDetailView = ({ feedback, currentUserId }: FeedbackDetailViewProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUserId === feedback.user.id;

  const categoryLabel =
    feedback.category === 'OTHER' && feedback.customCategory
      ? feedback.customCategory
      : (FEEDBACK_CATEGORY_MAP[feedback.category] ?? feedback.category);

  const date = new Date(feedback.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const initial = feedback.user.nickname.charAt(0).toUpperCase();
  const avatarColor = getAvatarColor(feedback.user.nickname);

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/feedback/${feedback.id}`, { method: 'DELETE' });

      if (response.ok) {
        router.push('/feedback');
        router.refresh();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{categoryLabel}</Badge>

          {!feedback.isPublic ? <Badge variant="outline">비공개</Badge> : null}
        </div>

        <h1 className="text-xl font-bold tracking-tight md:text-2xl">{feedback.title}</h1>

        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
              avatarColor,
            )}
          >
            {initial}
          </div>

          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <span className="text-foreground font-medium">{feedback.user.nickname}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={feedback.createdAt}>{date}</time>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent>
        <div className="bg-muted/50 rounded-lg p-4 md:p-5">
          <p className="text-sm leading-relaxed whitespace-pre-wrap md:text-base">
            {feedback.content}
          </p>
        </div>
      </CardContent>

      {isOwner ? (
        <>
          <Separator />

          <CardFooter className="justify-end">
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </CardFooter>
        </>
      ) : null}
    </Card>
  );
};
