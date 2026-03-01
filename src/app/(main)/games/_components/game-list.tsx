import { type GameSummary } from '@/types/game';

import { GameCard } from './game-card';

interface GameListProps {
  games: GameSummary[];
  isLoggedIn: boolean;
}

export const GameList = ({ games, isLoggedIn }: GameListProps) => {
  if (games.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">게임이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} isLoggedIn={isLoggedIn} />
      ))}
    </div>
  );
};
