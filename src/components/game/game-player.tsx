'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { postPlay, postRanking } from '@/lib/api/game';
import { generateRandomNickname } from '@/lib/random-nickname';
import { cn } from '@/lib/utils';
import { type PlatformToGameMessage } from '@/types/game';
import { trackEvent } from '@/components/providers/analytics-provider';
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
}

export const GamePlayer = ({ gameUrl, gameTitle, gameId, userId, nickname }: GamePlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasCountedRef = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  const toggleFullscreen = useCallback(async (): Promise<void> => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await container.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      setGuestNickname(generateRandomNickname());
    }
  }, [userId]);

  useEffect(() => {
    const handleFullscreenChange = (): void => {
      const isFull = Boolean(document.fullscreenElement);

      setIsFullscreen(isFull);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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
          trackEvent('game_ready', {
            game_id: gameId,
            game_title: gameTitle,
          });
          break;
        }

        case 'SCORE': {
          if (!hasCountedRef.current) {
            const playedKey = `played_${gameId}`;

            if (!sessionStorage.getItem(playedKey)) {
              hasCountedRef.current = true;
              sessionStorage.setItem(playedKey, '1');
              void postPlay(gameId);
              trackEvent('game_play', {
                game_id: gameId,
                game_title: gameTitle,
              });
            }
          }

          break;
        }

        case 'GAME_OVER': {
          const { score, playtime } = message.payload;

          if (!hasCountedRef.current) {
            const playedKey = `played_${gameId}`;

            if (!sessionStorage.getItem(playedKey)) {
              hasCountedRef.current = true;
              sessionStorage.setItem(playedKey, '1');
              void postPlay(gameId);
              trackEvent('game_play', {
                game_id: gameId,
                game_title: gameTitle,
              });
            }
          }

          trackEvent('game_over', {
            game_id: gameId,
            game_title: gameTitle,
            score,
            playtime,
          });

          if (userId) {
            void postRanking(gameId, score, playtime);
          }

          break;
        }

        case 'ERROR': {
          setGameState('error');
          setErrorInfo(message.payload);
          trackEvent('game_error', {
            game_id: gameId,
            game_title: gameTitle,
            error_code: message.payload.code,
          });
          break;
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [gameId, gameOrigin, gameTitle, sendInit, userId]);

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
      className={isFullscreen ? 'flex-1 border-0' : 'absolute inset-0 h-full w-full border-0'}
      allow="autoplay; fullscreen"
      sandbox="allow-scripts allow-same-origin"
    />
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-hidden rounded-lg border',
        isFullscreen ? 'flex h-full flex-col rounded-none border-0' : 'aspect-video',
      )}
    >
      {isFullscreen && (
        <div className="bg-background flex h-10 items-center justify-between border-b px-4">
          <span className="truncate text-sm font-medium">{gameTitle}</span>
          <Button variant="ghost" size="xs" onClick={() => void toggleFullscreen()}>
            나가기
          </Button>
        </div>
      )}
      <div className={cn('relative', isFullscreen ? 'flex-1' : 'h-full')}>
        {iframeElement}
        {renderOverlay()}
      </div>
      {!isFullscreen && gameState === 'playing' && (
        <Button
          variant="secondary"
          size="xs"
          className="absolute top-2 right-2 z-10 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 [div:hover>&]:opacity-70"
          onClick={() => void toggleFullscreen()}
        >
          전체화면
        </Button>
      )}
    </div>
  );
};
