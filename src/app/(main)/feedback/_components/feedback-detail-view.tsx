'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { type FeedbackDetail } from '@/types/feedback';
import { FEEDBACK_CATEGORY_MAP } from '@/constants/feedback';
import { Button } from '@/components/ui/button';

interface FeedbackDetailViewProps {
  feedback: FeedbackDetail;
  currentUserId?: string;
}

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
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-2">
        <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
          {categoryLabel}
        </span>

        {!feedback.isPublic ? <span className="text-muted-foreground text-xs">비공개</span> : null}
      </div>

      <h1 className="mb-2 text-2xl font-bold">{feedback.title}</h1>

      <div className="text-muted-foreground mb-6 flex items-center gap-2 text-sm">
        <span>{feedback.user.nickname}</span>
        <span>{date}</span>
      </div>

      <div className="prose prose-sm mb-6 whitespace-pre-wrap">{feedback.content}</div>

      <div className="flex items-center gap-2">
        <Link href="/feedback">
          <Button variant="outline" size="sm">
            목록으로
          </Button>
        </Link>

        {isOwner ? (
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? '삭제 중...' : '삭제'}
          </Button>
        ) : null}
      </div>
    </div>
  );
};
