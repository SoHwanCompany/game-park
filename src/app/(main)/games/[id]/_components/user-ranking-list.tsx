import { type UserRankingItem as UserRankingItemType } from '@/types/ranking';

import { UserRankingItem } from './user-ranking-item';

interface UserRankingListProps {
  rankings: UserRankingItemType[];
  currentUserId: string | null;
  currentUserRank: UserRankingItemType | null;
}

export const UserRankingList = ({
  rankings,
  currentUserId,
  currentUserRank,
}: UserRankingListProps) => {
  if (rankings.length === 0) {
    return (
      <div className="text-muted-foreground flex h-40 items-center justify-center rounded-lg border border-dashed">
        <p>아직 기록이 없습니다.</p>
      </div>
    );
  }

  const isCurrentUserInList = rankings.some((r) => r.userId === currentUserId);
  const showBanner = currentUserRank && !isCurrentUserInList;

  return (
    <div className="overflow-hidden rounded-lg border">
      {showBanner && (
        <div className="bg-primary/5 border-b px-4 py-2.5">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm font-bold">내 순위</span>
            <span className="text-sm font-bold">{currentUserRank.rank}위</span>
            <span className="text-muted-foreground ml-auto text-sm tabular-nums">
              {currentUserRank.score.toLocaleString()}점
            </span>
          </div>
        </div>
      )}

      <div className="max-h-[600px] divide-y overflow-y-auto">
        {rankings.map((item) => (
          <UserRankingItem
            key={item.userId}
            item={item}
            isCurrentUser={item.userId === currentUserId}
          />
        ))}
      </div>
    </div>
  );
};
