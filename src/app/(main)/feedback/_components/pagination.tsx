'use client';

import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  category?: string;
}

const getVisiblePages = (current: number, total: number): number[] => {
  const maxVisible = 5;

  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = current - half;
  let end = current + half;

  if (start < 1) {
    start = 1;
    end = maxVisible;
  }

  if (end > total) {
    end = total;
    start = total - maxVisible + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

export const Pagination = ({ currentPage, totalPages, category }: PaginationProps) => {
  const router = useRouter();

  if (totalPages <= 1) {
    return null;
  }

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

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav aria-label="페이지 네비게이션" className="mt-8 flex items-center justify-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={currentPage <= 1}
        onClick={() => handlePageChange(currentPage - 1)}
        aria-label="이전 페이지"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="size-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
      </Button>

      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'ghost'}
          size="icon-sm"
          onClick={() => handlePageChange(page)}
          aria-label={`${page} 페이지`}
          aria-current={page === currentPage ? 'page' : undefined}
          className={cn(
            'text-sm font-medium',
            page !== currentPage && 'text-muted-foreground hover:text-foreground',
          )}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="ghost"
        size="icon-sm"
        disabled={currentPage >= totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        aria-label="다음 페이지"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="size-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </Button>
    </nav>
  );
};
