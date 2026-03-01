'use client';

import Image from 'next/image';
import Link from 'next/link';

import { type GameSummary } from '@/types/game';
import { DEFAULT_THUMBNAIL } from '@/constants/game';

import { LikeButton } from './like-button';

interface GameCardProps {
  game: GameSummary;
  isLoggedIn: boolean;
}

export const GameCard = ({ game, isLoggedIn }: GameCardProps) => {
  return (
    <div className="group overflow-hidden rounded-lg border transition-shadow hover:shadow-md">
      <Link href={`/games/${game.id}`}>
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={game.thumbnailUrl || DEFAULT_THUMBNAIL}
            alt={game.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/games/${game.id}`}>
          <h3 className="truncate font-semibold">{game.title}</h3>
        </Link>
        <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{game.description}</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="bg-secondary text-muted-foreground rounded-full px-2 py-0.5 text-xs">
            {game.category.name}
          </span>

          <LikeButton
            gameId={game.id}
            initialLikeCount={game.likeCount}
            initialIsLiked={game.isLiked}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </div>
    </div>
  );
};
