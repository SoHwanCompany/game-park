import Image from 'next/image';
import Link from 'next/link';

import {
  type GameRankingItem as GameRankingItemType,
  type GameRankingSortType,
} from '@/types/ranking';
import { DEFAULT_THUMBNAIL } from '@/constants/game';
import { RankBadge } from '@/components/common/rank-badge';

interface GameRankingItemProps {
  game: GameRankingItemType;
  sortType: GameRankingSortType;
}

export const GameRankingItem = ({ game, sortType }: GameRankingItemProps) => {
  return (
    <Link
      href={`/games/${game.id}`}
      className="hover:bg-accent flex items-center gap-4 rounded-lg p-3 transition-colors"
    >
      <RankBadge rank={game.rank} />

      <div className="relative size-12 shrink-0 overflow-hidden rounded-md">
        <Image
          src={game.thumbnailUrl || DEFAULT_THUMBNAIL}
          alt={game.title}
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{game.title}</p>
        <span className="text-muted-foreground text-xs">{game.category.name}</span>
      </div>

      <span className="text-muted-foreground shrink-0 text-sm tabular-nums">
        {sortType === 'likes'
          ? `좋아요 ${game.likeCount.toLocaleString()}`
          : `플레이 ${game.playCount.toLocaleString()}`}
      </span>
    </Link>
  );
};
