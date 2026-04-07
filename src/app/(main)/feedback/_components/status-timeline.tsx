import { cn } from '@/lib/utils';
import { type FeedbackStatusLogItem } from '@/types/feedback';
import { FEEDBACK_STATUS_MAP } from '@/constants/feedback';

interface StatusTimelineProps {
  logs: FeedbackStatusLogItem[];
}

const STATUS_DOT: Record<string, string> = {
  PENDING: 'bg-muted-foreground',
  CONFIRMED: 'bg-blue-500',
  IN_REVIEW: 'bg-amber-500',
  RESOLVED: 'bg-green-500',
  DEFERRED: 'bg-gray-400',
};

export const StatusTimeline = ({ logs }: StatusTimelineProps) => {
  if (logs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">처리 현황</h3>

      <div className="space-y-3">
        {logs.map((log, index) => {
          const date = new Date(log.createdAt).toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          const isLast = index === logs.length - 1;

          return (
            <div key={log.id} className="relative flex gap-3 pl-4">
              <div className="absolute left-0 flex flex-col items-center">
                <div className={cn('mt-1.5 size-2.5 rounded-full', STATUS_DOT[log.status])} />

                {!isLast ? <div className="bg-border w-px flex-1" /> : null}
              </div>

              <div className="min-w-0 flex-1 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{FEEDBACK_STATUS_MAP[log.status]}</span>

                  <span className="text-muted-foreground text-xs">
                    {log.user.nickname} · {date}
                  </span>
                </div>

                {log.comment ? (
                  <p className="text-muted-foreground mt-1 text-sm">{log.comment}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
