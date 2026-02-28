'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useRegister } from '@/hooks/use-register';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { registerSchema, type RegisterFormValues } from '../_schemas/auth';

export const RegisterForm = () => {
  const { mutate, isPending, error } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormValues): void => {
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input id="email" type="email" placeholder="email@example.com" {...register('email')} />
        {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nickname">닉네임</Label>
        <Input id="nickname" type="text" placeholder="닉네임" {...register('nickname')} />
        {errors.nickname && <p className="text-destructive text-sm">{errors.nickname.message}</p>}
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

      {error && <p className="text-destructive text-center text-sm">{error.message}</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? '가입 중...' : '회원가입'}
      </Button>
    </form>
  );
};
