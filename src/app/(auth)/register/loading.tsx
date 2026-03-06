import { Skeleton } from '@/components/ui/skeleton';

export default function RegisterLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-8 w-24" />
        <Skeleton className="mx-auto h-4 w-64" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      <Skeleton className="mx-auto h-4 w-48" />
    </div>
  );
}
