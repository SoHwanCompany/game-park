'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { FEEDBACK_CATEGORIES } from '@/constants/feedback';
import { Button } from '@/components/ui/button';

interface FeedbackCategoryFilterProps {
  currentCategory?: string;
}

export const FeedbackCategoryFilter = ({ currentCategory }: FeedbackCategoryFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (code: string): void => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete('page');

    if (code === 'all') {
      params.delete('category');
    } else {
      params.set('category', code);
    }

    router.push(`/feedback?${params.toString()}`);
  };

  const active = currentCategory ?? 'all';

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={active === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleCategoryChange('all')}
      >
        전체
      </Button>

      {FEEDBACK_CATEGORIES.map((cat) => (
        <Button
          key={cat.value}
          variant={active === cat.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleCategoryChange(cat.value)}
        >
          {cat.label}
        </Button>
      ))}
    </div>
  );
};
