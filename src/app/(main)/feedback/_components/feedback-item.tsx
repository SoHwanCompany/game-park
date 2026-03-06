import Link from 'next/link';

import { cn } from '@/lib/utils';
import { type FeedbackSummary } from '@/types/feedback';
import { FEEDBACK_CATEGORY_MAP } from '@/constants/feedback';
import { Badge } from '@/components/ui/badge';

interface FeedbackItemProps {
  feedback: FeedbackSummary;
}

const CATEGORY_ACCENT: Record<string, string> = {
  BUG: 'border-l-destructive',
  FEATURE: 'border-l-primary',
  GENERAL: 'border-l-muted-foreground',
  GAME_REQUEST: 'border-l-accent-foreground',
  OTHER: 'border-l-border',
};

export const FeedbackItem = ({ feedback }: FeedbackItemProps) => {
  const categoryLabel =
    feedback.category === 'OTHER' && feedback.customCategory
      ? feedback.customCategory
      : (FEEDBACK_CATEGORY_MAP[feedback.category] ?? feedback.category);

  const date = new Date(feedback.createdAt).toLocaleDateString('ko-KR');

  const badgeVariant = feedback.category === 'OTHER' ? 'outline' : 'secondary';

  return (
    <Link
      href={`/feedback/${feedback.id}`}
      className={cn(
        'group flex items-start gap-4 border-l-[3px] px-4 py-4 transition-all duration-200',
        'hover:bg-accent/50',
        CATEGORY_ACCENT[feedback.category] ?? 'border-l-border',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant={badgeVariant}>{categoryLabel}</Badge>

          {!feedback.isPublic ? (
            <Badge variant="outline" className="text-muted-foreground gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="size-3"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z"
                  clipRule="evenodd"
                />
              </svg>
              비공개
            </Badge>
          ) : null}
        </div>

        <p className="group-hover:text-primary truncate text-[15px] font-semibold transition-colors">
          {feedback.title}
        </p>

        <div className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs">
          <span>{feedback.user.nickname}</span>
          <span aria-hidden="true" className="text-border">
            |
          </span>
          <span>{date}</span>
        </div>
      </div>

      {feedback._count.comments > 0 ? (
        <div className="text-muted-foreground flex shrink-0 items-center gap-1.5 pt-1 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-4"
            aria-hidden="true"
          >
            <path d="M1 8.74c0 .983.713 1.825 1.69 1.943.764.092 1.534.164 2.31.216v2.351a.75.75 0 0 0 1.28.53l2.51-2.51c.182-.181.427-.29.688-.307a41 41 0 0 0 2.832-.256c.977-.118 1.69-.96 1.69-1.943V4.26c0-.983-.713-1.825-1.69-1.943a41.6 41.6 0 0 0-9.62 0C1.713 2.435 1 3.277 1 4.26v4.482Z" />
          </svg>
          <span className="font-medium">{feedback._count.comments}</span>
        </div>
      ) : null}
    </Link>
  );
};
