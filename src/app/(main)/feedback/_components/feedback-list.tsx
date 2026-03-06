import { type FeedbackSummary } from '@/types/feedback';
import { Card, CardContent } from '@/components/ui/card';

import { FeedbackItem } from './feedback-item';

interface FeedbackListProps {
  feedbacks: FeedbackSummary[];
}

export const FeedbackList = ({ feedbacks }: FeedbackListProps) => {
  if (feedbacks.length === 0) {
    return (
      <Card className="py-0">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-muted mb-4 flex size-14 items-center justify-center rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="text-muted-foreground size-7"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.2 48.2 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.4 48.4 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
              />
            </svg>
          </div>

          <p className="text-foreground text-lg font-medium">등록된 의견이 없습니다</p>

          <p className="text-muted-foreground mt-1 text-sm">첫 번째 의견을 남겨 주세요</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="divide-border divide-y">
        {feedbacks.map((feedback) => (
          <FeedbackItem key={feedback.id} feedback={feedback} />
        ))}
      </div>
    </Card>
  );
};
