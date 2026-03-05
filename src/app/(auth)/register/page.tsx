import { type Metadata } from 'next';
import Link from 'next/link';

import { RegisterForm } from '../_components/register-form';

export const metadata: Metadata = {
  title: '회원가입',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">회원가입</h1>
        <p className="text-muted-foreground text-sm">
          게임파크에 가입하고 다양한 게임을 즐겨보세요.
        </p>
      </div>

      <RegisterForm />

      <p className="text-muted-foreground text-center text-sm">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
