'use client';

import { useState, useTransition } from 'react';

import { type GameStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';

const STATUS_OPTIONS: Array<{ value: GameStatus; label: string }> = [
  { value: 'DRAFT', label: '초안' },
  { value: 'PUBLISHED', label: '공개' },
  { value: 'SUSPENDED', label: '중단' },
  { value: 'ARCHIVED', label: '보관' },
];

interface GameStatusSelectProps {
  gameId: string;
  status: GameStatus;
}

export const GameStatusSelect = ({ gameId, status: initialStatus }: GameStatusSelectProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<GameStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>): Promise<void> => {
    const nextStatus = event.target.value as GameStatus;
    const prevStatus = status;

    setStatus(nextStatus);

    try {
      const response = await fetch(`/api/admin/games/${gameId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        setStatus(prevStatus);
        console.error('Failed to update game status', await response.text());

        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setStatus(prevStatus);
      console.error('Failed to update game status', error);
    }
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isPending}
      className="bg-background rounded-md border px-2 py-1 text-xs disabled:opacity-50"
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
