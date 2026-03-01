'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { postPlay, postRanking } from '@/lib/api/game';
import { generateRandomNickname } from '@/lib/random-nickname';
import { type PlatformToGameMessage } from '@/types/game';
import { Button } from '@/components/ui/button';

import {
  gameMessageSchema,
  type GameErrorPayload,
  type GameToPlatformMessage,
} from './game-message-schema';

const READY_TIMEOUT_MS = 10_000;

type GameState = 'loading' | 'playing' | 'error' | 'timeout';

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
  const [gameState, setGameState] = useState<GameState>('loading');
  const [errorInfo, setErrorInfo] = useState<GameErrorPayload | null>(null);
  const readyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameOrigin = new URL(gameUrl).origin;
  const gameOriginRef = useRef(gameOrigin);

  gameOriginRef.current = gameOrigin;
  const [guestNickname, setGuestNickname] = useState<string | null>(null);
  const displayNickname = nickname ?? guestNickname;

  const sendToGame = useCallback(
    (message: PlatformToGameMessage): void => {
      const iframe = iframeRef.current;

      if (!iframe?.contentWindow) {
        return;
      }

      iframe.contentWindow.postMessage(message, gameOrigin);
    },
    [gameOrigin],
  );

  const startReadyTimeout = useCallback((): void => {
    if (readyTimeoutRef.current) {
      clearTimeout(readyTimeoutRef.current);
    }

    readyTimeoutRef.current = setTimeout(() => {
      setGameState('timeout');
    }, READY_TIMEOUT_MS);
  }, []);

  const sendInit = useCallback((): void => {
    sendToGame({ type: 'INIT', payload: { userId, nickname: displayNickname, gameId } });
  }, [sendToGame, userId, displayNickname, gameId]);

  useEffect(() => {
    if (!userId) {
      setGuestNickname(generateRandomNickname());
    }
  }, [userId]);

  useEffect(() => {
    const playedKey = `played_${gameId}`;

    if (sessionStorage.getItem(playedKey)) {
      return;
    }

    sessionStorage.setItem(playedKey, '1');
    void postPlay(gameId);
  }, [gameId]);

  useEffect(() => {
    startReadyTimeout();

    return () => {
      if (readyTimeoutRef.current) {
        clearTimeout(readyTimeoutRef.current);
      }
    };
  }, [startReadyTimeout]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent): void => {
      if (event.origin !== gameOrigin) {
        return;
      }

      const parsed = gameMessageSchema.safeParse(event.data);

      if (!parsed.success) {
        return;
      }

      const message: GameToPlatformMessage = parsed.data;

      switch (message.type) {
        case 'READY': {
          if (readyTimeoutRef.current) {
            clearTimeout(readyTimeoutRef.current);
          }

          setGameState('playing');
          sendInit();
          break;
        }

        case 'SCORE': {
          break;
        }

        case 'GAME_OVER': {
          if (userId) {
            const { score } = message.payload;

            void postRanking(gameId, score);
          }

          break;
        }

        case 'ERROR': {
          setGameState('error');
          setErrorInfo(message.payload);
          break;
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [gameId, gameOrigin, sendInit, userId]);

  useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (gameState !== 'playing') {
        return;
      }

      if (document.hidden) {
        sendToGame({ type: 'PAUSE' });
      } else {
        sendToGame({ type: 'RESUME' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameState, sendToGame]);

  useEffect(() => {
    return () => {
      const iframe = iframeRef.current;
      const origin = gameOriginRef.current;

      if (!iframe?.contentWindow || !origin) {
        return;
      }

      iframe.contentWindow.postMessage({ type: 'TERMINATE' }, origin);
    };
  }, []);

  const handleRetry = useCallback((): void => {
    setGameState('loading');
    setErrorInfo(null);
    startReadyTimeout();

    const iframe = iframeRef.current;

    if (iframe) {
      iframe.src = gameUrl;
    }
  }, [gameUrl, startReadyTimeout]);

  const renderOverlay = (): React.ReactNode => {
    if (gameState === 'loading') {
      return (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
          <p className="text-sm text-white">게임을 불러오는 중...</p>
        </div>
      );
    }

    if (gameState === 'timeout') {
      return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/60">
          <p className="text-sm text-white">게임 로딩에 실패했습니다.</p>
          <Button variant="secondary" size="sm" onClick={handleRetry}>
            다시 시도
          </Button>
        </div>
      );
    }

    if (gameState === 'error') {
      return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/60">
          <p className="text-sm text-white">
            {errorInfo?.message ?? '게임에서 오류가 발생했습니다.'}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleRetry}>
              다시 시도
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/games/${gameId}`}>나가기</Link>
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  const iframeElement = (
    <iframe
      ref={iframeRef}
      src={gameUrl}
      title={gameTitle}
      className={
        variant === 'fullscreen' ? 'flex-1 border-0' : 'absolute inset-0 h-full w-full border-0'
      }
      allow="autoplay; fullscreen"
      sandbox="allow-scripts allow-same-origin"
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
        <div className="relative flex-1">
          {iframeElement}
          {renderOverlay()}
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
      {iframeElement}
      {renderOverlay()}
    </div>
  );
};
