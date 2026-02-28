import { Suspense } from 'react';

import Link from 'next/link';

import { LoginForm } from '../_components/login-form';

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">로그인</h1>
        <p className="text-muted-foreground text-sm">계정에 로그인하세요.</p>
      </div>

      <Suspense>
        <LoginForm />
      </Suspense>

      <p className="text-muted-foreground text-center text-sm">
        계정이 없으신가요?{' '}
        <Link href="/register" className="text-primary underline-offset-4 hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
