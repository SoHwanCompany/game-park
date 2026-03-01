import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const rankBadgeVariants = cva('inline-flex items-center justify-center text-sm font-bold', {
  variants: {
    variant: {
      gold: 'size-8 rounded-full bg-yellow-100 text-yellow-700',
      silver: 'size-8 rounded-full bg-gray-100 text-gray-600',
      bronze: 'size-8 rounded-full bg-orange-100 text-orange-700',
      default: 'text-muted-foreground w-8 text-center',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const getRankVariant = (
  rank: number,
): NonNullable<VariantProps<typeof rankBadgeVariants>['variant']> => {
  switch (rank) {
    case 1:
      return 'gold';
    case 2:
      return 'silver';
    case 3:
      return 'bronze';
    default:
      return 'default';
  }
};

interface RankBadgeProps {
  rank: number;
  className?: string;
}

export const RankBadge = ({ rank, className }: RankBadgeProps) => {
  const variant = getRankVariant(rank);

  return <span className={cn(rankBadgeVariants({ variant }), className)}>{rank}</span>;
};
