import { type FeedbackCategory, type FeedbackStatus } from '@prisma/client';
import Link from 'next/link';

import { getAdminFeedbacks } from '@/lib/admin/feedbacks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { FeedbackFilters } from './_components/feedback-filters';

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  PENDING: '대기',
  CONFIRMED: '확인',
  IN_REVIEW: '검토 중',
  RESOLVED: '해결',
  DEFERRED: '보류',
};

const STATUS_VARIANT: Record<FeedbackStatus, 'default' | 'secondary' | 'outline' | 'destructive'> =
  {
    PENDING: 'destructive',
    CONFIRMED: 'outline',
    IN_REVIEW: 'default',
    RESOLVED: 'secondary',
    DEFERRED: 'secondary',
  };

const CATEGORY_LABEL: Record<FeedbackCategory, string> = {
  BUG: '버그',
  FEATURE: '기능',
  GENERAL: '일반',
  GAME_REQUEST: '게임 요청',
  OTHER: '기타',
};

const VALID_STATUSES: FeedbackStatus[] = [
  'PENDING',
  'CONFIRMED',
  'IN_REVIEW',
  'RESOLVED',
  'DEFERRED',
];
const VALID_CATEGORIES: FeedbackCategory[] = ['BUG', 'FEATURE', 'GENERAL', 'GAME_REQUEST', 'OTHER'];

interface AdminFeedbackPageProps {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}

export default async function AdminFeedbackPage({ searchParams }: AdminFeedbackPageProps) {
  const sp = await searchParams;
  const status =
    sp.status && VALID_STATUSES.includes(sp.status as FeedbackStatus)
      ? (sp.status as FeedbackStatus)
      : undefined;
  const category =
    sp.category && VALID_CATEGORIES.includes(sp.category as FeedbackCategory)
      ? (sp.category as FeedbackCategory)
      : undefined;

  const feedbacks = await getAdminFeedbacks({ q: sp.q, status, category });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">피드백 처리</h2>
      <FeedbackFilters />

      <div className="bg-card overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr className="text-muted-foreground text-left text-xs font-medium">
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">카테고리</th>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">작성자</th>
              <th className="px-4 py-3">게임</th>
              <th className="px-4 py-3">공개</th>
              <th className="px-4 py-3">작성일</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {feedbacks.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-muted-foreground px-4 py-8 text-center">
                  조건에 맞는 피드백이 없습니다.
                </td>
              </tr>
            ) : (
              feedbacks.map((feedback) => (
                <tr key={feedback.id}>
                  <td className="px-4 py-2">
                    <Badge variant={STATUS_VARIANT[feedback.status]}>
                      {STATUS_LABEL[feedback.status]}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground px-4 py-2 text-xs">
                    {CATEGORY_LABEL[feedback.category]}
                  </td>
                  <td className="px-4 py-2 font-medium">{feedback.title}</td>
                  <td className="text-muted-foreground px-4 py-2">{feedback.user.nickname}</td>
                  <td className="text-muted-foreground px-4 py-2">{feedback.game?.title ?? '-'}</td>
                  <td className="px-4 py-2">
                    {feedback.isPublic ? (
                      <span className="text-muted-foreground text-xs">공개</span>
                    ) : (
                      <Badge variant="secondary">비공개</Badge>
                    )}
                  </td>
                  <td className="text-muted-foreground px-4 py-2 text-xs">
                    {new Date(feedback.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/feedback/${feedback.id}`}>처리</Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
