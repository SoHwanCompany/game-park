'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { FEEDBACK_CATEGORIES } from '@/constants/feedback';
import { Badge } from '@/components/ui/badge';

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
      <button type="button" onClick={() => handleCategoryChange('all')}>
        <Badge
          variant={active === 'all' ? 'default' : 'outline'}
          className="cursor-pointer px-3 py-1 text-sm transition-all duration-200 hover:shadow-sm"
        >
          전체
        </Badge>
      </button>

      {FEEDBACK_CATEGORIES.map((cat) => (
        <button key={cat.value} type="button" onClick={() => handleCategoryChange(cat.value)}>
          <Badge
            variant={active === cat.value ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1 text-sm transition-all duration-200 hover:shadow-sm"
          >
            {cat.label}
          </Badge>
        </button>
      ))}
    </div>
  );
};
