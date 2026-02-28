import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { postRegister } from '@/lib/api/auth';
import { type RegisterFormValues } from '@/app/(auth)/_schemas/auth';

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterFormValues) => postRegister(data),
    onSuccess: () => {
      router.push('/login?registered=true');
    },
  });
};
