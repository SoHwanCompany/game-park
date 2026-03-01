import {
  type GameRankingItem as GameRankingItemType,
  type GameRankingSortType,
} from '@/types/ranking';

import { GameRankingItem } from './game-ranking-item';

interface GameRankingListProps {
  games: GameRankingItemType[];
  sortType: GameRankingSortType;
}

export const GameRankingList = ({ games, sortType }: GameRankingListProps) => {
  if (games.length === 0) {
    return (
      <div className="text-muted-foreground flex h-40 items-center justify-center rounded-lg border border-dashed">
        <p>등록된 게임이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="divide-y rounded-lg border">
      {games.map((game) => (
        <GameRankingItem key={game.id} game={game} sortType={sortType} />
      ))}
    </div>
  );
};
