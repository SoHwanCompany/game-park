import { Skeleton } from '@/components/ui/skeleton';

export const GameCardSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
};
