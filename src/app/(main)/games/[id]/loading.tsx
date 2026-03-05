import { GamePlayerSkeleton } from '@/components/common/game-player-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function GameDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <GamePlayerSkeleton />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-5 w-80" />
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}
