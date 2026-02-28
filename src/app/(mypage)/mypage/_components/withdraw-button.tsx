'use client';

import { useState } from 'react';

import { useWithdraw } from '@/hooks/use-withdraw';
import { Button } from '@/components/ui/button';

export const WithdrawButton = () => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { mutate, isPending, error } = useWithdraw();

  if (!isConfirming) {
    return (
      <Button variant="destructive" className="w-full" onClick={() => setIsConfirming(true)}>
        회원 탈퇴
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-destructive text-center text-sm font-medium">
        정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
      </p>

      {error && <p className="text-destructive text-center text-sm">{error.message}</p>}

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setIsConfirming(false)}
          disabled={isPending}
        >
          취소
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => mutate()}
          disabled={isPending}
        >
          {isPending ? '탈퇴 처리 중...' : '탈퇴 확인'}
        </Button>
      </div>
    </div>
  );
};
