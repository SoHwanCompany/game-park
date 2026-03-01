'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { SORT_OPTIONS } from '@/constants/game';

interface SortSelectProps {
  currentSort?: string;
}

export const SortSelect = ({ currentSort }: SortSelectProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const params = new URLSearchParams(searchParams.toString());
    const value = e.target.value;

    if (value === 'latest') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }

    router.push(`/games?${params.toString()}`);
  };

  return (
    <select
      value={currentSort ?? 'latest'}
      onChange={handleSortChange}
      className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
