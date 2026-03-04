import { Skeleton } from '@/components/ui/skeleton';

export default function MypageLoading() {
  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Skeleton className="mb-6 h-8 w-28" />

      <div className="space-y-8">
        <section className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-48" />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </section>
      </div>
    </div>
  );
}
