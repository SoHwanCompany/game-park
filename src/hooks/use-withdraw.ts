import { useMutation } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';

import { deleteWithdraw } from '@/lib/api/user';

export const useWithdraw = () => {
  return useMutation({
    mutationFn: () => deleteWithdraw(),
    onSuccess: async () => {
      await signOut({ callbackUrl: '/' });
    },
  });
};
