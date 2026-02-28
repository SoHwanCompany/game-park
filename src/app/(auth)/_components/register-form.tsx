'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { type ApiResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { registerSchema, type RegisterFormValues } from '../_schemas/auth';

export const RegisterForm = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues): Promise<void> => {
    setServerError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<unknown> = await response.json();

      if (!response.ok) {
        setServerError(result.message);

        return;
      }

      router.push('/login?registered=true');
    } catch {
      setServerError('서버 오류가 발생했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input id="email" type="email" placeholder="email@example.com" {...register('email')} />
        {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">닉네임</Label>
        <Input id="name" type="text" placeholder="닉네임" {...register('name')} />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input id="password" type="password" placeholder="8자 이상" {...register('password')} />
        {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
        <Input
          id="passwordConfirm"
          type="password"
          placeholder="비밀번호 확인"
          {...register('passwordConfirm')}
        />
        {errors.passwordConfirm && (
          <p className="text-destructive text-sm">{errors.passwordConfirm.message}</p>
        )}
      </div>

      {serverError.length > 0 && (
        <p className="text-destructive text-center text-sm">{serverError}</p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? '가입 중...' : '회원가입'}
      </Button>
    </form>
  );
};
