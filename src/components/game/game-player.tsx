'use client';

import { useCallback, useEffect, useRef } from 'react';

import Link from 'next/link';

import { postPlay, postRanking } from '@/lib/api/game';
import { type GameEndMessage } from '@/types/game';
import { Button } from '@/components/ui/button';

interface GamePlayerProps {
  gameUrl: string;
  gameTitle: string;
  gameId: string;
  userId: string | null;
  nickname: string | null;
  variant?: 'embedded' | 'fullscreen';
}

export const GamePlayer = ({
  gameUrl,
  gameTitle,
  gameId,
  userId,
  nickname,
  variant = 'embedded',
}: GamePlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const playedKey = `played_${gameId}`;

    if (sessionStorage.getItem(playedKey)) {
      return;
    }

    sessionStorage.setItem(playedKey, '1');
    void postPlay(gameId);
  }, [gameId]);

  const handleIframeLoad = useCallback((): void => {
    const iframe = iframeRef.current;

    if (!iframe?.contentWindow) {
      return;
    }

    const origin = new URL(gameUrl).origin;

    iframe.contentWindow.postMessage({ type: 'GAME_INIT', payload: { userId, nickname } }, origin);
  }, [gameUrl, userId, nickname]);

  useEffect(() => {
    const gameOrigin = new URL(gameUrl).origin;

    const handleMessage = (event: MessageEvent): void => {
      if (event.origin !== gameOrigin) {
        return;
      }

      const data = event.data as GameEndMessage;

      if (data?.type !== 'GAME_END') {
        return;
      }

      const { userId: endUserId, score } = data.payload;

      if (!endUserId || typeof score !== 'number') {
        return;
      }

      void postRanking(gameId, score);
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [gameId, gameUrl]);

  const iframeElement = (
    <iframe
      ref={iframeRef}
      src={gameUrl}
      title={gameTitle}
      className={
        variant === 'fullscreen' ? 'flex-1 border-0' : 'absolute inset-0 h-full w-full border-0'
      }
      onLoad={handleIframeLoad}
      allow="autoplay; fullscreen"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
    />
  );

  if (variant === 'fullscreen') {
    return (
      <div className="flex h-full flex-col">
        <div className="bg-background flex h-10 items-center justify-between border-b px-4">
          <span className="truncate text-sm font-medium">{gameTitle}</span>
          <Button variant="ghost" size="xs" asChild>
            <Link href={`/games/${gameId}`}>나가기</Link>
          </Button>
        </div>
        {iframeElement}
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
      {iframeElement}
    </div>
  );
};
