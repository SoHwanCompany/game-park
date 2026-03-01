'use client';

import { AlertDialog } from 'radix-ui';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'alert' | 'confirm';
  onConfirm?: () => void;
}

export const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  variant = 'alert',
  onConfirm,
}: ModalProps) => {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/40',
            'data-[state=open]:animate-[modal-overlay-in_150ms_ease-out]',
            'data-[state=closed]:animate-[modal-overlay-out_150ms_ease-in]',
          )}
        />
        <AlertDialog.Content
          className={cn(
            'bg-background fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-lg',
            'data-[state=open]:animate-[modal-content-in_150ms_ease-out]',
            'data-[state=closed]:animate-[modal-content-out_150ms_ease-in]',
          )}
        >
          <AlertDialog.Title className="text-lg font-semibold">{title}</AlertDialog.Title>
          {description && (
            <AlertDialog.Description className="text-muted-foreground mt-2 text-sm">
              {description}
            </AlertDialog.Description>
          )}
          <div className="mt-6 flex justify-end gap-2">
            {variant === 'confirm' && (
              <AlertDialog.Cancel asChild>
                <Button variant="outline" size="sm">
                  {cancelLabel}
                </Button>
              </AlertDialog.Cancel>
            )}
            <AlertDialog.Action asChild onClick={onConfirm}>
              <Button size="sm">{confirmLabel}</Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
