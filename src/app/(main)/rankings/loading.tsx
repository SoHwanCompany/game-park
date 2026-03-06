import { RankingItemSkeleton } from '@/components/common/ranking-item-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function RankingsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-64" />
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-40" />
      </div>

      <div className="divide-y rounded-lg border">
        {Array.from({ length: 10 }).map((_, i) => (
          <RankingItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
