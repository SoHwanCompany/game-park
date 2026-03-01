import { cn } from '@/lib/utils';
import { type UserRankingItem as UserRankingItemType } from '@/types/ranking';
import { RankBadge } from '@/components/common/rank-badge';

interface UserRankingItemProps {
  item: UserRankingItemType;
  isCurrentUser: boolean;
}

export const UserRankingItem = ({ item, isCurrentUser }: UserRankingItemProps) => {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2.5',
        isCurrentUser && 'bg-primary/5 font-bold',
      )}
    >
      <RankBadge rank={item.rank} />

      <span className="min-w-0 flex-1 truncate text-sm">{item.nickname}</span>

      <span className="text-muted-foreground shrink-0 text-sm tabular-nums">
        {item.score.toLocaleString()}점
      </span>
    </div>
  );
};
