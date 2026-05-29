import { type FeedbackStatus } from '@prisma/client';
import { notFound } from 'next/navigation';

import { getAdminFeedbackById } from '@/lib/admin/feedbacks';
import { Badge } from '@/components/ui/badge';

import { AdminCommentForm } from '../_components/admin-comment-form';
import { FeedbackStatusForm } from '../_components/feedback-status-form';

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  PENDING: '대기',
  CONFIRMED: '확인',
  IN_REVIEW: '검토 중',
  RESOLVED: '해결',
  DEFERRED: '보류',
};

interface AdminFeedbackDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminFeedbackDetailPage({ params }: AdminFeedbackDetailPageProps) {
  const { id } = await params;
  const feedback = await getAdminFeedbackById(id);

  if (!feedback) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{STATUS_LABEL[feedback.status]}</Badge>
          {!feedback.isPublic && <Badge variant="secondary">비공개</Badge>}
          {feedback.game && (
            <span className="text-muted-foreground text-xs">게임: {feedback.game.title}</span>
          )}
        </div>
        <h2 className="text-2xl font-bold">{feedback.title}</h2>
        <p className="text-muted-foreground text-sm">
          {feedback.user.nickname} ({feedback.user.email}) ·{' '}
          {new Date(feedback.createdAt).toLocaleString('ko-KR')}
        </p>
      </header>

      <article className="bg-card rounded-lg border p-4 text-sm whitespace-pre-wrap">
        {feedback.content}
      </article>

      <section className="space-y-3 rounded-lg border p-4">
        <h3 className="text-sm font-semibold">상태 변경</h3>
        <FeedbackStatusForm feedbackId={feedback.id} currentStatus={feedback.status} />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">상태 변경 이력</h3>
        {feedback.statusLogs.length === 0 ? (
          <p className="text-muted-foreground text-sm">기록 없음</p>
        ) : (
          <ol className="space-y-2 text-sm">
            {feedback.statusLogs.map((log) => (
              <li key={log.id} className="bg-card rounded-md border p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">
                    {STATUS_LABEL[log.status]} · {log.user.nickname}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString('ko-KR')}
                  </span>
                </div>
                {log.comment && (
                  <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{log.comment}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">댓글</h3>
        {feedback.comments.length === 0 ? (
          <p className="text-muted-foreground text-sm">댓글 없음</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {feedback.comments.map((comment) => (
              <li
                key={comment.id}
                className="bg-card space-y-1 rounded-md border p-3 data-[deleted=true]:opacity-50"
                data-deleted={comment.deletedAt !== null}
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium">{comment.user.nickname}</span>
                  {comment.user.role === 'ADMIN' && <Badge variant="outline">운영자</Badge>}
                  <span className="text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString('ko-KR')}
                  </span>
                  {comment.deletedAt && <Badge variant="secondary">삭제됨</Badge>}
                </div>
                <p className="whitespace-pre-wrap">{comment.content}</p>
              </li>
            ))}
          </ul>
        )}
        <div className="bg-card rounded-md border p-3">
          <AdminCommentForm feedbackId={feedback.id} />
        </div>
      </section>
    </div>
  );
}
