'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GameOption {
  id: string;
  title: string;
}

interface GameSelectProps {
  games: GameOption[];
  value: string | null;
  onChange: (gameId: string | null) => void;
}

export const GameSelect = ({ games, value, onChange }: GameSelectProps): React.ReactNode => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedGame = games.find((g) => g.id === value);

  const filtered = games.filter((g) => g.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-2">
      <Label>관련 게임 (선택사항)</Label>

      <div ref={containerRef} className="relative">
        {selectedGame ? (
          <div className="border-input bg-background flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <span>{selectedGame.title}</span>

            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-muted-foreground hover:text-foreground ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        ) : (
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="게임 이름을 검색하세요"
          />
        )}

        {isOpen && !selectedGame && filtered.length > 0 ? (
          <ul className="bg-popover border-border absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border shadow-md">
            {filtered.map((game) => (
              <li key={game.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(game.id);
                    setSearch('');
                    setIsOpen(false);
                  }}
                  className={cn(
                    'hover:bg-accent w-full px-3 py-2 text-left text-sm transition-colors',
                  )}
                >
                  {game.title}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {isOpen && !selectedGame && search.length > 0 && filtered.length === 0 ? (
          <div className="bg-popover border-border text-muted-foreground absolute z-50 mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-md">
            검색 결과가 없습니다
          </div>
        ) : null}
      </div>

      <p className="text-muted-foreground text-xs">
        특정 게임에 대한 의견이라면 게임을 선택해주세요.
      </p>
    </div>
  );
};
