import Link from 'next/link';

import { type FeedbackSummary } from '@/types/feedback';
import { FEEDBACK_CATEGORY_MAP } from '@/constants/feedback';

interface FeedbackItemProps {
  feedback: FeedbackSummary;
}

export const FeedbackItem = ({ feedback }: FeedbackItemProps) => {
  const categoryLabel =
    feedback.category === 'OTHER' && feedback.customCategory
      ? feedback.customCategory
      : (FEEDBACK_CATEGORY_MAP[feedback.category] ?? feedback.category);

  const date = new Date(feedback.createdAt).toLocaleDateString('ko-KR');

  return (
    <Link
      href={`/feedback/${feedback.id}`}
      className="hover:bg-accent flex items-center gap-4 p-4 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
            {categoryLabel}
          </span>

          {!feedback.isPublic ? (
            <span className="text-muted-foreground text-xs">비공개</span>
          ) : null}
        </div>

        <p className="truncate font-medium">{feedback.title}</p>

        <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
          <span>{feedback.user.nickname}</span>
          <span>{date}</span>
        </div>
      </div>

      {feedback._count.comments > 0 ? (
        <span className="text-muted-foreground shrink-0 text-sm">
          댓글 {feedback._count.comments}
        </span>
      ) : null}
    </Link>
  );
};
