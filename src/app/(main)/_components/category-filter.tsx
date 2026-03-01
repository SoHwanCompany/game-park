'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { type CategoryItem } from '@/types/game';
import { ALL_CATEGORY } from '@/constants/game';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  categories: CategoryItem[];
  currentCategory?: string;
  basePath?: string;
}

export const CategoryFilter = ({
  categories,
  currentCategory,
  basePath = '/games',
}: CategoryFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (code: string): void => {
    const params = new URLSearchParams(searchParams.toString());

    if (code === 'all') {
      params.delete('category');
    } else {
      params.set('category', code);
    }

    router.push(`${basePath}?${params.toString()}`);
  };

  const allCategories = [ALL_CATEGORY, ...categories];
  const active = currentCategory ?? 'all';

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((cat) => (
        <Button
          key={cat.code}
          variant={active === cat.code ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleCategoryChange(cat.code)}
        >
          {cat.name}
        </Button>
      ))}
    </div>
  );
};
