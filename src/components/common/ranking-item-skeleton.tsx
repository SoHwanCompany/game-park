import { Skeleton } from '@/components/ui/skeleton';

export const RankingItemSkeleton = () => {
  return (
    <div className="flex items-center gap-4 rounded-lg p-3">
      <Skeleton className="size-8 rounded-full" />
      <Skeleton className="size-12 rounded-md" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/5" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
};
