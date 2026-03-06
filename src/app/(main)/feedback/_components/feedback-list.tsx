import { type FeedbackSummary } from '@/types/feedback';

import { FeedbackItem } from './feedback-item';

interface FeedbackListProps {
  feedbacks: FeedbackSummary[];
}

export const FeedbackList = ({ feedbacks }: FeedbackListProps) => {
  if (feedbacks.length === 0) {
    return (
      <div className="text-muted-foreground flex h-40 items-center justify-center rounded-lg border border-dashed">
        <p>등록된 의견이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="divide-y rounded-lg border">
      {feedbacks.map((feedback) => (
        <FeedbackItem key={feedback.id} feedback={feedback} />
      ))}
    </div>
  );
};
