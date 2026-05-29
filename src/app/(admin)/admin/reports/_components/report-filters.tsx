'use client';

import { useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';

export const ReportFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState(searchParams.get('status') ?? 'PENDING');
  const [targetType, setTargetType] = useState(searchParams.get('targetType') ?? '');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (status) {
      params.set('status', status);
    }

    if (targetType) {
      params.set('targetType', targetType);
    }

    const query = params.toString();

    router.push(query ? `/admin/reports?${query}` : '/admin/reports');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="bg-background h-9 rounded-md border px-3 text-sm"
      >
        <option value="">상태 전체</option>
        <option value="PENDING">미처리</option>
        <option value="DISMISSED">유지</option>
        <option value="ACTIONED">조치됨</option>
      </select>
      <select
        value={targetType}
        onChange={(event) => setTargetType(event.target.value)}
        className="bg-background h-9 rounded-md border px-3 text-sm"
      >
        <option value="">대상 전체</option>
        <option value="FEEDBACK">피드백</option>
        <option value="COMMENT">댓글</option>
      </select>
      <Button type="submit">적용</Button>
    </form>
  );
};
