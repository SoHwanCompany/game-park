import { Suspense } from 'react';

import { type FeedbackCategory } from '@prisma/client';
import { type Metadata } from 'next';
import Link from 'next/link';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FEEDBACK_PAGE_SIZE } from '@/constants/feedback';
import { Button } from '@/components/ui/button';

import { FeedbackCategoryFilter } from './_components/feedback-category-filter';
import { FeedbackList } from './_components/feedback-list';
import { Pagination } from './_components/pagination';

export const metadata: Metadata = {
  title: '의견 게시판',
  description:
    'Game Park에 대한 의견을 남겨주세요. 버그 신고, 기능 제안, 게임 요청 등을 할 수 있습니다.',
};

interface FeedbackPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function FeedbackPage({ searchParams }: FeedbackPageProps) {
  const { category, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? '1'));
  const session = await auth();
  const currentUserId = session?.user?.id;

  const where = {
    ...(category && category !== 'all' ? { category: category as FeedbackCategory } : {}),
    OR: [{ isPublic: true }, ...(currentUserId ? [{ userId: currentUserId }] : [])],
  };

  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * FEEDBACK_PAGE_SIZE,
      take: FEEDBACK_PAGE_SIZE,
      select: {
        id: true,
        title: true,
        category: true,
        customCategory: true,
        status: true,
        isPublic: true,
        createdAt: true,
        user: { select: { nickname: true } },
        game: { select: { title: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.feedback.count({ where }),
  ]);

  const totalPages = Math.ceil(total / FEEDBACK_PAGE_SIZE);

  const serialized = feedbacks.map((f) => ({
    ...f,
    createdAt: new Date(f.createdAt).toISOString(),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">의견 게시판</h1>
          <p className="text-muted-foreground">Game Park에 대한 의견을 자유롭게 남겨주세요.</p>
        </div>

        {session?.user ? (
          <Link href="/feedback/new">
            <Button>의견 작성</Button>
          </Link>
        ) : null}
      </div>

      <div className="mb-6">
        <Suspense fallback={<div className="bg-muted h-8 w-64 animate-pulse rounded-md" />}>
          <FeedbackCategoryFilter currentCategory={category} />
        </Suspense>
      </div>

      <FeedbackList feedbacks={serialized} />

      {totalPages > 1 ? (
        <Pagination currentPage={page} totalPages={totalPages} category={category} />
      ) : null}
    </div>
  );
}
