import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { putProfile } from '@/lib/api/user';
import { type ProfileUpdateFormValues } from '@/app/(mypage)/mypage/_schemas/profile';

export const useProfileUpdate = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ProfileUpdateFormValues) => putProfile(data),
    onSuccess: () => {
      router.refresh();
    },
  });
};
