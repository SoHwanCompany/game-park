import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { postLike } from '@/lib/api/game';

interface UseLikeOptions {
  gameId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
  isLoggedIn: boolean;
}

export const useLike = ({
  gameId,
  initialIsLiked,
  initialLikeCount,
  isLoggedIn,
}: UseLikeOptions) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const mutation = useMutation({
    mutationFn: () => postLike(gameId),
    onMutate: () => {
      const prevIsLiked = isLiked;
      const prevLikeCount = likeCount;

      setIsLiked((prev) => !prev);
      setLikeCount((prev) => (prevIsLiked ? prev - 1 : prev + 1));

      return { prevIsLiked, prevLikeCount };
    },
    onSuccess: (data) => {
      if (data.data) {
        setIsLiked(data.data.isLiked);
        setLikeCount(data.data.likeCount);
      }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        setIsLiked(context.prevIsLiked);
        setLikeCount(context.prevLikeCount);
      }
    },
  });

  const handleLike = (): void => {
    if (!isLoggedIn) {
      setShowLoginModal(true);

      return;
    }

    mutation.mutate();
  };

  return {
    isLiked,
    likeCount,
    handleLike,
    isPending: mutation.isPending,
    showLoginModal,
    setShowLoginModal,
  };
};
