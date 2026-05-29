'use client';

import { useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const FeedbackFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (q) {
      params.set('q', q);
    }

    if (status) {
      params.set('status', status);
    }

    if (category) {
      params.set('category', category);
    }

    const query = params.toString();

    router.push(query ? `/admin/feedback?${query}` : '/admin/feedback');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
      <Input
        placeholder="제목 또는 내용 검색"
        value={q}
        onChange={(event) => setQ(event.target.value)}
        className="max-w-xs"
      />
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="bg-background h-9 rounded-md border px-3 text-sm"
      >
        <option value="">상태 전체</option>
        <option value="PENDING">대기</option>
        <option value="CONFIRMED">확인</option>
        <option value="IN_REVIEW">검토 중</option>
        <option value="RESOLVED">해결</option>
        <option value="DEFERRED">보류</option>
      </select>
      <select
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        className="bg-background h-9 rounded-md border px-3 text-sm"
      >
        <option value="">카테고리 전체</option>
        <option value="BUG">버그</option>
        <option value="FEATURE">기능 제안</option>
        <option value="GENERAL">일반</option>
        <option value="GAME_REQUEST">게임 요청</option>
        <option value="OTHER">기타</option>
      </select>
      <Button type="submit">검색</Button>
    </form>
  );
};
