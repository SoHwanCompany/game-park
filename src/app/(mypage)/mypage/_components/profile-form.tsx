'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { type ApiResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { profileUpdateSchema, type ProfileUpdateFormValues } from '../_schemas/profile';

interface ProfileFormProps {
  initialNickname: string;
  email: string;
}

export const ProfileForm = ({ initialNickname, email }: ProfileFormProps) => {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: { nickname: initialNickname },
  });

  const onSubmit = async (data: ProfileUpdateFormValues): Promise<void> => {
    setServerError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<unknown> = await response.json();

      if (!response.ok) {
        setServerError(result.message);

        return;
      }

      setSuccessMessage('프로필이 수정되었습니다.');
      reset({ nickname: data.nickname });
      router.refresh();
    } catch {
      setServerError('서버 오류가 발생했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input id="email" type="email" value={email} disabled />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nickname">닉네임</Label>
        <Input id="nickname" type="text" placeholder="닉네임" {...register('nickname')} />
        {errors.nickname && <p className="text-destructive text-sm">{errors.nickname.message}</p>}
      </div>

      {serverError.length > 0 && (
        <p className="text-destructive text-center text-sm">{serverError}</p>
      )}

      {successMessage.length > 0 && (
        <p className="text-center text-sm text-green-600">{successMessage}</p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? '수정 중...' : '프로필 수정'}
      </Button>
    </form>
  );
};
