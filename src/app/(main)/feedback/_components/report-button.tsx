'use client';

import { useState } from 'react';

import { type ReportTargetType } from '@prisma/client';

import { Button } from '@/components/ui/button';

import { ReportModal } from './report-modal';

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  size?: 'default' | 'xs';
}

export const ReportButton = ({ targetType, targetId, size = 'xs' }: ReportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size={size}
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-destructive"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="size-3.5"
          aria-hidden="true"
        >
          <path d="M3.5 2a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 1 0V9.5l1.566-.783A3.5 3.5 0 0 0 7.12 6.62l.18-.458a3.5 3.5 0 0 1 3.12-2.105l2.08-.18V2H3.5Z" />
        </svg>
      </Button>

      <ReportModal
        open={isOpen}
        onOpenChange={setIsOpen}
        targetType={targetType}
        targetId={targetId}
      />
    </>
  );
};
