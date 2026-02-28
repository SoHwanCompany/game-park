'use client';

import { signOut } from 'next-auth/react';

import { Button } from '@/components/ui/button';

export const LogoutButton = () => {
  const handleLogout = (): void => {
    void signOut({ callbackUrl: '/' });
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      로그아웃
    </Button>
  );
};
