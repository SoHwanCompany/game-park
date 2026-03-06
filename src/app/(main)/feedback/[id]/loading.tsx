import { Skeleton } from '@/components/ui/skeleton';

export default function FeedbackDetailLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Skeleton className="mb-2 h-6 w-20" />
      <Skeleton className="mb-4 h-9 w-3/4" />
      <Skeleton className="mb-2 h-4 w-40" />
      <Skeleton className="mb-8 h-32 w-full" />

      <Skeleton className="mb-4 h-6 w-24" />

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mb-3 space-y-2 rounded-lg border p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}
