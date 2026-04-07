'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { loginSchema, type LoginFormValues } from '../_schemas/auth';

const downgradeToSessionCookie = (): void => {
  const cookieName = 'authjs.session-token';
  const cookie = document.cookie.split('; ').find((c) => c.startsWith(`${cookieName}=`));

  if (cookie) {
    const value = cookie.split('=').slice(1).join('=');

    document.cookie = `${cookieName}=${value}; path=/; SameSite=Lax`;
  }
};

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const registered = searchParams.get('registered') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues): Promise<void> => {
    setServerError('');

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setServerError('이메일 또는 비밀번호가 올바르지 않습니다.');

        return;
      }

      if (!rememberMe) {
        downgradeToSessionCookie();
      }

      window.location.href = '/';
    } catch {
      setServerError('서버 오류가 발생했습니다.');
    }
  };

  const handleSocialLogin = (provider: string): void => {
    void signIn(provider, { callbackUrl: '/' });
  };

  return (
    <div className="space-y-6">
      {registered && (
        <p className="text-center text-sm text-green-600">
          회원가입이 완료되었습니다. 로그인해주세요.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input id="email" type="email" placeholder="email@example.com" {...register('email')} />
          {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input id="password" type="password" placeholder="비밀번호" {...register('password')} />
          {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span className="text-muted-foreground text-sm">자동 로그인</span>
        </label>

        {serverError.length > 0 && (
          <p className="text-destructive text-center text-sm">{serverError}</p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? '로그인 중...' : '로그인'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">소셜 로그인</span>
        </div>
      </div>

      <Button
        type="button"
        className="w-full bg-[#FEE500] text-[#191919] hover:bg-[#FDD835]"
        onClick={() => handleSocialLogin('kakao')}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mr-2"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9 0.6C4.029 0.6 0 3.726 0 7.554C0 9.918 1.558 12.002 3.931 13.244L2.933 16.844C2.845 17.156 3.213 17.402 3.483 17.218L7.873 14.356C8.242 14.398 8.617 14.42 9 14.42C13.971 14.42 18 11.294 18 7.466C18 3.638 13.971 0.6 9 0.6Z"
            fill="#191919"
          />
        </svg>
        카카오 로그인
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">또는</span>
        </div>
      </div>

      <Button variant="link" className="text-muted-foreground w-full" asChild>
        <Link href="/">로그인 없이 둘러보기</Link>
      </Button>
    </div>
  );
};
