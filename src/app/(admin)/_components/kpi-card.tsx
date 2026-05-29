import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: number;
  className?: string;
}

export const KpiCard = ({ label, value, className }: KpiCardProps) => (
  <div className={cn('bg-card rounded-lg border p-4 shadow-sm', className)}>
    <p className="text-muted-foreground text-sm">{label}</p>
    <p className="mt-2 text-2xl font-bold">{value.toLocaleString()}</p>
  </div>
);
