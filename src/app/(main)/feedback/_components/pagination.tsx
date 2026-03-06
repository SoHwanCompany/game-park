'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  category?: string;
}

export const Pagination = ({ currentPage, totalPages, category }: PaginationProps) => {
  const router = useRouter();

  const handlePageChange = (page: number): void => {
    const params = new URLSearchParams();

    if (category) {
      params.set('category', category);
    }

    if (page > 1) {
      params.set('page', String(page));
    }

    const query = params.toString();

    router.push(`/feedback${query ? `?${query}` : ''}`);
  };

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        이전
      </Button>

      <span className="text-muted-foreground text-sm">
        {currentPage} / {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        다음
      </Button>
    </div>
  );
};
