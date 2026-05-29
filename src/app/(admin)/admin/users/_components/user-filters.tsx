'use client';

import { useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const UserFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [role, setRole] = useState(searchParams.get('role') ?? '');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (q) {
      params.set('q', q);
    }

    if (status) {
      params.set('status', status);
    }

    if (role) {
      params.set('role', role);
    }

    const query = params.toString();

    router.push(query ? `/admin/users?${query}` : '/admin/users');
  };

  const handleReset = (): void => {
    setQ('');
    setStatus('');
    setRole('');
    router.push('/admin/users');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
      <Input
        placeholder="닉네임 또는 이메일 검색"
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
        <option value="ACTIVE">활성</option>
        <option value="SUSPENDED">정지</option>
        <option value="WITHDRAWN">탈퇴</option>
      </select>
      <select
        value={role}
        onChange={(event) => setRole(event.target.value)}
        className="bg-background h-9 rounded-md border px-3 text-sm"
      >
        <option value="">권한 전체</option>
        <option value="USER">일반</option>
        <option value="ADMIN">관리자</option>
      </select>
      <Button type="submit">검색</Button>
      <Button type="button" variant="outline" onClick={handleReset}>
        초기화
      </Button>
    </form>
  );
};
