'use client';

import { useState } from 'react';

import { signOut } from 'next-auth/react';

import { type ApiResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';

export const WithdrawButton = () => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleWithdraw = async (): Promise<void> => {
    setIsProcessing(true);
    setServerError('');

    try {
      const response = await fetch('/api/user/withdraw', { method: 'DELETE' });

      const result: ApiResponse<unknown> = await response.json();

      if (!response.ok) {
        setServerError(result.message);
        setIsProcessing(false);

        return;
      }

      await signOut({ callbackUrl: '/' });
    } catch {
      setServerError('서버 오류가 발생했습니다.');
      setIsProcessing(false);
    }
  };

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

      {serverError.length > 0 && (
        <p className="text-destructive text-center text-sm">{serverError}</p>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setIsConfirming(false)}
          disabled={isProcessing}
        >
          취소
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => void handleWithdraw()}
          disabled={isProcessing}
        >
          {isProcessing ? '탈퇴 처리 중...' : '탈퇴 확인'}
        </Button>
      </div>
    </div>
  );
};
