'use client';

import { useRouter } from 'next/navigation';

import { useLike } from '@/hooks/use-like';
import { Modal } from '@/components/ui/modal';

interface LikeButtonProps {
  gameId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  isLoggedIn: boolean;
}

export const LikeButton = ({
  gameId,
  initialLikeCount,
  initialIsLiked,
  isLoggedIn,
}: LikeButtonProps) => {
  const router = useRouter();
  const { isLiked, likeCount, handleLike, isPending, showLoginModal, setShowLoginModal } = useLike({
    gameId,
    initialIsLiked,
    initialLikeCount,
    isLoggedIn,
  });

  return (
    <>
      <button
        type="button"
        onClick={handleLike}
        disabled={isPending}
        className="flex items-center gap-1 text-sm transition-colors disabled:opacity-50"
        aria-label={isLiked ? '좋아요 취소' : '좋아요'}
      >
        <span className={isLiked ? 'text-red-500' : 'text-muted-foreground'}>
          {isLiked ? '♥' : '♡'}
        </span>
        <span className="text-muted-foreground">{likeCount}</span>
      </button>

      <Modal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        title="로그인이 필요합니다"
        description="로그인 페이지로 이동하시겠습니까?"
        variant="confirm"
        confirmLabel="로그인"
        onConfirm={() => router.push('/login')}
      />
    </>
  );
};
