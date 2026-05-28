'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { postSocialConsent } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  defaultAuthConsentValues,
  loginSchema,
  socialConsentSchema,
  type AuthConsentValues,
  type LoginFormValues,
  type SocialConsentValues,
} from '../_schemas/auth';
import { AuthConsentSection } from './auth-consent-section';

const LOGIN_EMAIL_STORAGE_KEY = 'saved-login-email';

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [socialError, setSocialError] = useState('');
  const registered = searchParams.get('registered') === 'true';

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const {
    watch: watchSocialConsent,
    setValue: setSocialConsentValue,
    getValues: getSocialConsentValues,
    trigger: validateSocialConsent,
    formState: { errors: socialConsentErrors },
  } = useForm<SocialConsentValues>({
    resolver: zodResolver(socialConsentSchema),
    defaultValues: {
      ...defaultAuthConsentValues,
    },
  });

  useEffect(() => {
    const savedEmail = window.localStorage.getItem(LOGIN_EMAIL_STORAGE_KEY);

    if (!savedEmail) {
      return;
    }

    setRememberEmail(true);
    reset({
      email: savedEmail,
      password: '',
    });
  }, [reset]);

  const onSubmit = async (data: LoginFormValues): Promise<void> => {
    setServerError('');
    setSocialError('');

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

      if (rememberEmail) {
        window.localStorage.setItem(LOGIN_EMAIL_STORAGE_KEY, data.email);
      } else {
        window.localStorage.removeItem(LOGIN_EMAIL_STORAGE_KEY);
      }

      window.location.href = '/';
    } catch {
      setServerError('서버 오류가 발생했습니다.');
    }
  };

  const socialConsentValues = watchSocialConsent([
    'termsAgreed',
    'privacyAgreed',
    'marketingAgreed',
  ]);

  const handleSocialConsentChange = (field: keyof AuthConsentValues, checked: boolean): void => {
    setSocialConsentValue(field, checked, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleSocialLogin = async (provider: string): Promise<void> => {
    setSocialError('');

    const isValid = await validateSocialConsent();

    if (!isValid) {
      setSocialError('소셜 회원가입을 진행하려면 필수 약관에 동의해주세요.');

      return;
    }

    try {
      await postSocialConsent(getSocialConsentValues());
      await signIn(provider, { callbackUrl: '/' });
    } catch {
      setSocialError('소셜 로그인 준비 중 오류가 발생했습니다.');
    }
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
            checked={rememberEmail}
            onChange={(e) => setRememberEmail(e.target.checked)}
          />
          <span className="text-muted-foreground text-sm">이메일 저장</span>
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

      <AuthConsentSection
        title="소셜 회원가입 동의"
        description="카카오로 처음 시작할 때 필수 약관 동의가 필요합니다."
        values={{
          termsAgreed: socialConsentValues[0] ?? false,
          privacyAgreed: socialConsentValues[1] ?? false,
          marketingAgreed: socialConsentValues[2] ?? false,
        }}
        errors={{
          termsAgreed: socialConsentErrors.termsAgreed?.message,
          privacyAgreed: socialConsentErrors.privacyAgreed?.message,
          marketingAgreed: socialConsentErrors.marketingAgreed?.message,
        }}
        onChange={handleSocialConsentChange}
      />

      {socialError.length > 0 && (
        <p className="text-destructive text-center text-sm">{socialError}</p>
      )}

      <Button
        type="button"
        className="w-full bg-[#FEE500] text-[#191919] hover:bg-[#FDD835]"
        onClick={() => {
          void handleSocialLogin('kakao');
        }}
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
