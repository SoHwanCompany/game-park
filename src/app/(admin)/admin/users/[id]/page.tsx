import { notFound } from 'next/navigation';

import { getAdminUserById } from '@/lib/admin/users';
import { auth } from '@/lib/auth';

import { UserActions } from '../_components/user-actions';

interface AdminUserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { id } = await params;
  const [user, session] = await Promise.all([getAdminUserById(id), auth()]);

  if (!user) {
    notFound();
  }

  const isSelf = session?.user?.id === user.id;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold">{user.nickname}</h2>
        <p className="text-muted-foreground text-sm">{user.email}</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat label="플레이한 게임" value={user.activity.playedGames} />
        <Stat label="좋아요" value={user.activity.likedGames} />
        <Stat label="작성한 피드백" value={user.activity.feedbacks} />
        <Stat label="작성한 댓글" value={user.activity.comments} />
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">기본 정보</h3>
        <dl className="bg-card grid grid-cols-2 gap-4 rounded-lg border p-4 text-sm">
          <Field label="가입일" value={new Date(user.createdAt).toLocaleString('ko-KR')} />
          <Field
            label="이메일 인증"
            value={
              user.emailVerifiedAt
                ? new Date(user.emailVerifiedAt).toLocaleString('ko-KR')
                : '미인증'
            }
          />
          <Field label="EXP" value={user.exp.toLocaleString()} />
        </dl>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">계정 액션</h3>
        <UserActions
          userId={user.id}
          initialStatus={user.status}
          initialRole={user.role}
          initialNickname={user.nickname}
          isSelf={isSelf}
        />
      </section>
    </div>
  );
}

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-card rounded-lg border p-4">
    <p className="text-muted-foreground text-sm">{label}</p>
    <p className="mt-1 text-2xl font-bold tabular-nums">{value.toLocaleString()}</p>
  </div>
);

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-muted-foreground text-xs">{label}</dt>
    <dd className="mt-1 font-medium">{value}</dd>
  </div>
);
