'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { type GameRankingSortType } from '@/types/ranking';
import { GAME_RANKING_SORT_OPTIONS } from '@/constants/ranking';
import { Button } from '@/components/ui/button';

interface RankingSortToggleProps {
  currentSort: GameRankingSortType;
}

export const RankingSortToggle = ({ currentSort }: RankingSortToggleProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: GameRankingSortType): void => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === 'likes') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }

    router.push(`/rankings?${params.toString()}`);
  };

  return (
    <div className="flex gap-1">
      {GAME_RANKING_SORT_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          variant={currentSort === opt.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleSortChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
};
