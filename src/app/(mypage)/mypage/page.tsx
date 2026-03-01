import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { ProfileForm } from './_components/profile-form';
import { WithdrawButton } from './_components/withdraw-button';

export default async function MypagePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      nickname: true,
      role: true,
      exp: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">마이페이지</h1>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">회원 정보</h2>

          <div className="text-muted-foreground space-y-2 text-sm">
            <p>
              등급:{' '}
              <span className="text-foreground">
                {user.role === 'ADMIN' ? '관리자' : '일반 회원'}
              </span>
            </p>
            <p>
              경험치: <span className="text-foreground">{user.exp} EXP</span>
            </p>
            <p>
              가입일:{' '}
              <span className="text-foreground">{user.createdAt.toLocaleDateString('ko-KR')}</span>
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">프로필 수정</h2>
          <ProfileForm initialNickname={user.nickname} email={user.email} />
        </section>

        <section className="border-destructive/20 space-y-4 border-t pt-6">
          <h2 className="text-lg font-semibold">계정 삭제</h2>
          <p className="text-muted-foreground text-sm">
            탈퇴 시 계정이 비활성화되며, 연동된 소셜 계정 정보가 삭제됩니다.
          </p>
          <WithdrawButton />
        </section>
      </div>
    </div>
  );
}
