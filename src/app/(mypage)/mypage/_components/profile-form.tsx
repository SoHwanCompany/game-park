'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useProfileUpdate } from '@/hooks/use-profile-update';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { profileUpdateSchema, type ProfileUpdateFormValues } from '../_schemas/profile';

interface ProfileFormProps {
  initialNickname: string;
  email: string;
}

export const ProfileForm = ({ initialNickname, email }: ProfileFormProps) => {
  const { mutate, isPending, isSuccess, error } = useProfileUpdate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: { nickname: initialNickname },
  });

  const onSubmit = (data: ProfileUpdateFormValues): void => {
    mutate(data, {
      onSuccess: () => {
        reset({ nickname: data.nickname });
      },
    });
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

      {error && <p className="text-destructive text-center text-sm">{error.message}</p>}

      {isSuccess && !isDirty && (
        <p className="text-center text-sm text-green-600">프로필이 수정되었습니다.</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending || !isDirty}>
        {isPending ? '수정 중...' : '프로필 수정'}
      </Button>
    </form>
  );
};
