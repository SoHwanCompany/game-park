'use client';

import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function FeedbackError({ reset }: ErrorProps) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24">
      <h2 className="mb-2 text-2xl font-bold">문제가 발생했습니다</h2>
      <p className="text-muted-foreground mb-6">의견 게시판을 불러오는 중 오류가 발생했습니다.</p>
      <Button onClick={reset}>다시 시도</Button>
    </div>
  );
}
